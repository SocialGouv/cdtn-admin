"""Poursuite de navigation après une fiche Service Public (réplica SQL Matomo).

Pour chaque fiche SP (slug), device (desktop / mobile) et type de référent
(``referrertype`` Matomo : direct, search, website, campaign, social, ai…), compte
des **visites** (jamais des pages vues) :

* ``nb_visites_total`` — visites ayant vu la fiche (``…/fiche-service-public/{slug}``),
  quelle que soit leur page d'entrée ;
* ``nb_visites_fiche_sp`` — parmi elles, celles qui **démarrent** sur cette fiche
  (première page vue du jour) ;
* ``nb_visites_suite`` — parmi ces dernières, celles qui consultent ensuite
  **une autre page** que cette fiche (un rechargement ne compte pas ; revenir sur la
  fiche après une autre page compte).

Les taux ne sont pas stockés (valeurs dérivables, calculées dans Metabase) :
part d'entrée = ``nb_visites_fiche_sp / nb_visites_total`` ; poursuite de
navigation = ``nb_visites_suite / nb_visites_fiche_sp``.
"""

from __future__ import annotations

import re

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.reports._parcours import classify, query_pages

ENTRY_COLUMN = "nb_visites_fiche_sp"

# Slug de la fiche dans l'URL, avec ou sans slash final, requête ou ancre.
_FICHE_SP_RE = re.compile(r"/fiche-service-public/([^/?#]+)")
_FICHE_SP_LIKE = "%/fiche-service-public/%"

_QUERY_PAGES = query_pages()


def fiche_sp_slug(url: str) -> str | None:
    """Slug de la fiche SP d'une URL, ``None`` si ce n'est pas une fiche SP."""
    match = _FICHE_SP_RE.search(url)
    return match.group(1) if match else None


def get_parcours_fiches_sp(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Retourne les visites entrant par une fiche SP, et leur poursuite.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, referrer_type, slug,
        nb_visites_total, nb_visites_fiche_sp, nb_visites_suite. Une ligne par
        (device, referrer_type, slug) ayant au moins une visite ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        pages = client.run_query_df(
            _QUERY_PAGES, (date, date, date, date, _FICHE_SP_LIKE)
        )
    return classify_events(pages)


def classify_events(pages: pd.DataFrame) -> pd.DataFrame:
    """Classe les visites et agrège par (device, référent, slug)."""
    return classify(pages, fiche_sp_slug, ENTRY_COLUMN)
