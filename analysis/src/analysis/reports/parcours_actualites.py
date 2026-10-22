"""Poursuite de navigation après une page d'actualité (réplica SQL Matomo).

Pour chaque actualité (slug), device (desktop / mobile) et type de référent
(``referrertype`` Matomo : direct, search, website, campaign, social, ai…), compte des
**visites** (jamais des pages vues) :

* ``nb_visites_total`` — visites ayant vu l'actualité (``…/actualite/{slug}``),
  quelle que soit leur page d'entrée ;
* ``nb_visites_actualite`` — parmi elles, celles qui **démarrent** sur cette
  actualité, c'est-à-dire dont la première page vue du jour est la page de
  l'actualité ;
* ``nb_visites_suite`` — parmi ces dernières, celles qui ont ensuite consulté
  **une autre page** du site : au moins une page vue postérieure dont l'URL
  diffère de celle d'entrée (une autre actualité ou la liste des actualités
  comptent ; un simple rechargement non).

Les taux ne sont pas stockés (valeurs dérivables, calculées dans Metabase) :
part d'entrée = ``nb_visites_actualite / nb_visites_total`` ; poursuite de
navigation = ``nb_visites_suite / nb_visites_actualite``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import device_from_os

_COLUMNS = [
    "device",
    "referrer_type",
    "slug",
    "nb_visites_total",
    "nb_visites_actualite",
    "nb_visites_suite",
]

# Référent des visites sans ``referrertype`` renseigné.
_REFERRER_UNKNOWN = "inconnu"

# Slug de l'actualité dans l'URL : ``…/actualite/{slug}``, avec ou sans slash
# final, requête ou ancre.
_ACTUALITE_RE = r"/actualite/([^/?#]+)"
_ACTUALITE_LIKE = "%/actualite/%"

_EVENT_COLUMNS = [
    "idvisit",
    "actions",
    "action_id",
    "operatingsystemname",
    "referrertype",
    "action_url",
]

# Pages vues des visites qui ont vu au moins une actualité ce jour-là (la visite
# est reconstruite via ``idvisit``).
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
ORDER BY idvisit, actions, action_id;
"""


def get_parcours_actualites(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Retourne les visites entrant par une actualité, et leur poursuite.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, referrer_type, slug,
        nb_visites_total, nb_visites_actualite, nb_visites_suite. Une ligne par
        (device, referrer_type, slug)
        ayant au moins une visite entrante ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        pages = client.run_query_df(
            _QUERY_PAGES, (date, date, date, date, _ACTUALITE_LIKE)
        )
    return classify_events(pages)


def classify_events(pages: pd.DataFrame) -> pd.DataFrame:
    """Classe les visites et agrège par (device, référent, slug).

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        pages: pages vues, avec au moins les colonnes ``idvisit``, ``actions``,
            ``action_id``, ``operatingsystemname``, ``referrertype`` et
            ``action_url``.
    """
    if pages.empty:
        return pd.DataFrame(columns=_COLUMNS)

    pages = pages.sort_values(["idvisit", "actions", "action_id"])
    pages = pages.assign(slug=pages["action_url"].str.extract(_ACTUALITE_RE)[0])

    # Visites ayant vu chaque actualité (une visite compte une fois par slug).
    seen = pages.dropna(subset=["slug"]).drop_duplicates(["idvisit", "slug"])
    if seen.empty:
        return pd.DataFrame(columns=_COLUMNS)

    # Une visite démarre sur une actualité si sa première page vue en est une.
    first = pages.drop_duplicates("idvisit", keep="first").set_index("idvisit")
    entries = first.dropna(subset=["slug"])

    # Poursuite : une page vue après l'entrée, d'une URL différente.
    first_action = pages["idvisit"].map(entries["actions"])
    first_url = pages["idvisit"].map(entries["action_url"])
    later = pages[
        (pages["actions"] > first_action) & (pages["action_url"] != first_url)
    ]

    is_entry = seen["idvisit"].map(entries["slug"]) == seen["slug"]
    visits = pd.DataFrame(
        {
            "device": seen["operatingsystemname"].map(device_from_os),
            "referrer_type": _referrer(seen["referrertype"]),
            "slug": seen["slug"],
            "nb_visites_total": 1,
            "nb_visites_actualite": is_entry.astype(int),
            "nb_visites_suite": (
                is_entry & seen["idvisit"].isin(later["idvisit"])
            ).astype(int),
        }
    )
    out = visits.groupby(["device", "referrer_type", "slug"], as_index=False).sum()
    return out.loc[:, _COLUMNS]


def _referrer(referrer_type: pd.Series) -> pd.Series:
    """Type de référent normalisé (minuscules), ``inconnu`` si absent."""
    return (
        referrer_type.fillna(_REFERRER_UNKNOWN)
        .str.lower()
        .replace("", _REFERRER_UNKNOWN)
    )
