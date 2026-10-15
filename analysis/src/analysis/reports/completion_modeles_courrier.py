"""Complétion des modèles de courrier (réplica SQL Matomo).

Pour chaque modèle de courrier (slug) et chaque device (desktop / mobile), compte
des **visites** (jamais des events) :

* ``nb_visites`` — visites ayant vu une page de modèle de courrier
  (``action_type = 'action'`` et URL contenant ``modeles-de-courriers/{slug}``) ;
* ``nb_download`` — parmi elles, celles qui ont **téléchargé** un fichier après
  avoir vu le modèle (``action_type = 'download'``) ;
* ``nb_copier_coller`` — parmi elles, celles qui n'ont pas téléchargé mais ont
  **copié/collé** le contenu (event ``type_CTRL_C``, catégorie
  ``page_modeles_de_documents``) après avoir vu le modèle.

Le download n'est pas rattaché au modèle (il porte l'URL du fichier, pas celle de
la page) : on reconstruit donc la visite entière, on ordonne ses actions (colonne
``actions``) et on cherche un download / copier-coller **après** la vue du modèle.
On ne retient qu'**un seul modèle par visite** (le premier vu). Une visite avec à
la fois un download et un copier-coller est comptée en download.

Les taux ne sont pas stockés (valeurs dérivables, calculées dans Metabase) :
complétion = ``(nb_download + nb_copier_coller) / nb_visites``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import device_from_os

_COLUMNS = ["device", "slug", "nb_visites", "nb_download", "nb_copier_coller"]

_ACTION_COPY = "type_CTRL_C"
_CATEGORY_COPY = "page_modeles_de_documents"

# Slug du modèle dans l'URL de la page : ``…/modeles-de-courriers/{slug}``, avec
# ou sans slash final, requête ou ancre. La page liste (sans slug) n'y correspond
# pas.
_MODEL_PAGE_RE = r"modeles-de-courriers/([^/?#]+)"

_EVENT_COLUMNS = [
    "idvisit",
    "actions",
    "action_id",
    "operatingsystemname",
    "action_type",
    "action_url",
    "action_eventcategory",
    "action_eventaction",
]

# Toutes les pages modèle, downloads et copier-coller des visites qui ont vu au
# moins un modèle ce jour-là (la visite est reconstruite via ``idvisit``).
_QUERY = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND idvisit IN (
        SELECT idvisit
        FROM matomo_partitioned
        WHERE action_timestamp >= %s
          AND action_timestamp < %s::date + 1
          AND action_type = 'action'
          AND action_url LIKE %s
  )
  AND (
        (action_type = 'action' AND action_url LIKE %s)
     OR action_type = 'download'
     OR (
            action_type = 'event'
        AND action_eventcategory = %s
        AND action_eventaction = %s
     )
  )
ORDER BY idvisit, actions, action_id;
"""


def get_completion_modeles_courrier(
    date: str, matomo: object | None = None
) -> pd.DataFrame:
    """Retourne les visites, downloads et copier-coller par modèle et device.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, slug, nb_visites, nb_download,
        nb_copier_coller. Une ligne par (device, slug) ayant au moins une visite
        ce jour-là. Le taux se déduit de (nb_download + nb_copier_coller) /
        nb_visites.
    """
    page_like = "%modeles-de-courriers/%"
    with MatomoSQLConnectorSync() as client:
        events = client.run_query_df(
            _QUERY,
            (
                date,
                date,
                date,
                date,
                page_like,
                page_like,
                _CATEGORY_COPY,
                _ACTION_COPY,
            ),
        )
    return classify_events(events)


def classify_events(events: pd.DataFrame) -> pd.DataFrame:
    """Classe les visites d'un jeu d'events et agrège par (device, slug).

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        events: pages modèle, downloads et copier-coller, avec au moins les
            colonnes ``idvisit``, ``actions``, ``action_id``,
            ``operatingsystemname``, ``action_type``, ``action_url``,
            ``action_eventcategory`` et ``action_eventaction``.
    """
    if events.empty:
        return pd.DataFrame(columns=_COLUMNS)

    events = events.sort_values(["idvisit", "actions", "action_id"])

    # Device de la visite (clé de ``DEVICE_SEGMENTS``), déduit de l'OS : le
    # réplica SQL n'expose pas ``deviceType``, donc les segments ne s'y appliquent
    # pas (cf. ``matomo_segments.device_from_os``). L'OS est constant dans une
    # visite : on lit celui de son premier event.
    devices = (
        events.drop_duplicates("idvisit")
        .set_index("idvisit")["operatingsystemname"]
        .map(device_from_os)
    )

    # Premier modèle vu de chaque visite (un seul modèle par visite).
    pages = events[events["action_type"] == "action"].copy()
    pages["slug"] = pages["action_url"].str.extract(_MODEL_PAGE_RE)[0]
    first_view = (
        pages.dropna(subset=["slug"])
        .drop_duplicates("idvisit", keep="first")
        .set_index("idvisit")[["slug", "actions"]]
    )
    if first_view.empty:
        return pd.DataFrame(columns=_COLUMNS)

    # Un download / copier-coller ne compte que s'il suit la vue du modèle.
    first_action = events["idvisit"].map(first_view["actions"])
    after = events[events["actions"] > first_action]
    has_download = after.loc[
        after["action_type"] == "download", "idvisit"
    ].drop_duplicates()
    has_copy = after.loc[after["action_type"] == "event", "idvisit"].drop_duplicates()

    visits = first_view.assign(
        device=devices.reindex(first_view.index),
        nb_download=first_view.index.isin(has_download).astype(int),
    )
    # Le download prime sur le copier-coller.
    visits["nb_copier_coller"] = (
        first_view.index.isin(has_copy) & (visits["nb_download"] == 0)
    ).astype(int)
    visits["nb_visites"] = 1

    return (
        visits.groupby(["device", "slug"], as_index=False)[
            ["nb_visites", "nb_download", "nb_copier_coller"]
        ]
        .sum()
        .loc[:, _COLUMNS]
    )
