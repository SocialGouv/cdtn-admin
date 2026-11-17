"""Poursuite de navigation après le simulateur brut/net (réplica SQL Matomo).

Pour chaque device (desktop / mobile) et type de référent (``referrertype``
Matomo : direct, search, website…), compte des **visites** (jamais des pages
vues) autour de la page du simulateur
``https://code.travail.gouv.fr/outils/simulateur-embauche`` :

* ``nb_visites_total`` — visites ayant vu le simulateur, quelle que soit leur page
  d'entrée ;
* ``nb_visites_entree`` — parmi elles, celles qui **démarrent** sur le simulateur
  (première page vue du jour) ;
* ``nb_visites_suite`` — parmi ces dernières, celles qui ont ensuite consulté
  **une autre page** du site : au moins une page vue postérieure dont le chemin
  diffère de celui du simulateur (requête et ancre ignorées : un changement de
  paramètres du simulateur ou un rechargement ne comptent pas).

Les taux ne sont pas stockés (valeurs dérivables, calculées dans Metabase) :
part d'entrée = ``nb_visites_entree / nb_visites_total`` ; poursuite de
navigation = ``nb_visites_suite / nb_visites_entree``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import device_from_os
from analysis.reports.parcours_actualites import normalize_referrer
from analysis.visit_order import with_position

_COLUMNS = [
    "device",
    "referrer_type",
    "nb_visites_total",
    "nb_visites_entree",
    "nb_visites_suite",
]

# Page du simulateur : ``…/outils/simulateur-embauche``, avec ou sans slash final,
# requête ou ancre (``simulateur-embauche-xxx`` n'y correspond pas).
PAGE_PATH = "/outils/simulateur-embauche"
_PAGE_LIKE = f"%{PAGE_PATH}%"
_PAGE_RE = rf"{PAGE_PATH}(?:[/?#]|$)"
# Chemin d'une URL, sans requête ni ancre ni slash final.
_PATH_RE = r"^https?://[^/]+(/[^?#]*)"

_EVENT_COLUMNS = [
    "idvisit",
    "action_id",
    "action_timestamp",
    "operatingsystemname",
    "referrertype",
    "action_url",
]

# Pages vues des visites qui ont vu le simulateur ce jour-là (la visite est
# reconstruite via ``idvisit``).
_QUERY_PAGES = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND action_type = 'action'
  AND idvisit IN (
        SELECT idvisit
        FROM matomo_partitioned
        WHERE action_timestamp >= %s
          AND action_timestamp < %s::date + 1
          AND action_type = 'action'
          AND action_url LIKE %s
  )
ORDER BY idvisit, action_timestamp, action_id;
"""


def get_parcours_brut_net(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Retourne les visites du simulateur brut/net et leur poursuite.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, referrer_type, nb_visites_total,
        nb_visites_entree, nb_visites_suite. Une ligne par (device, referrer_type)
        ayant au moins une visite sur le simulateur ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        pages = client.run_query_df(_QUERY_PAGES, (date, date, date, date, _PAGE_LIKE))
    return classify_events(pages)


def classify_events(pages: pd.DataFrame) -> pd.DataFrame:
    """Classe les visites et agrège par (device, référent).

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        pages: pages vues, avec au moins les colonnes ``idvisit``, ``action_id``,
            ``action_timestamp``, ``operatingsystemname``, ``referrertype`` et
            ``action_url``.
    """
    if pages.empty:
        return pd.DataFrame(columns=_COLUMNS)

    pages = with_position(pages)
    url = pages["action_url"].fillna("")
    pages = pages.assign(
        is_tool=url.str.contains(_PAGE_RE, regex=True),
        path=url.str.extract(_PATH_RE)[0].fillna("/").str.rstrip("/"),
    )

    seen_ids = pages.loc[pages["is_tool"], "idvisit"].unique()
    if len(seen_ids) == 0:
        return pd.DataFrame(columns=_COLUMNS)

    # Une visite démarre sur le simulateur si sa première page vue en est une.
    first = pages.drop_duplicates("idvisit", keep="first").set_index("idvisit")
    entered = first.loc[first["is_tool"]]

    # Poursuite : une page vue après l'entrée, d'un chemin différent.
    first_position = pages["idvisit"].map(entered["position"])
    first_path = pages["idvisit"].map(entered["path"])
    later = pages[(pages["position"] > first_position) & (pages["path"] != first_path)]

    visits = first.loc[first.index.isin(seen_ids)]
    is_entry = visits.index.isin(entered.index)
    out = pd.DataFrame(
        {
            "device": visits["operatingsystemname"].map(device_from_os),
            "referrer_type": normalize_referrer(visits["referrertype"]),
            "nb_visites_total": 1,
            "nb_visites_entree": is_entry.astype(int),
            "nb_visites_suite": (is_entry & visits.index.isin(later["idvisit"])).astype(
                int
            ),
        }
    )
    return out.groupby(["device", "referrer_type"], as_index=False).sum()[_COLUMNS]
