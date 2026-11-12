"""Poursuite de navigation après une contribution (réplica SQL Matomo).

Pour chaque contribution (slug), device (desktop / mobile) et type de référent
(``referrertype`` Matomo : direct, search, website, campaign, social, ai…), compte
des **visites** (jamais des pages vues) :

* ``nb_visites_total`` — visites ayant vu la contribution, quelle que soit leur
  page d'entrée ;
* ``nb_visites_contribution`` — parmi elles, celles qui **démarrent** sur cette
  contribution (première page vue du jour) ;
* ``nb_visites_suite`` — parmi ces dernières, celles qui consultent ensuite
  **une autre page** que cette contribution.

Formes d'URL (le slug est celui de la contribution, sans IDCC) :

* générique : ``/contribution/{slug}`` ;
* personnalisée : ``/contribution/{idcc}-{slug}`` ;
* exception ``les-conges-pour-evenements-familiaux`` :
  ``/contribution/{slug}/{idcc}-{nom de la CC}``.

Passer de la version générique à une version personnalisée de la **même**
contribution (ou l'inverse, ou d'une CC à une autre) n'est pas une poursuite : les
trois formes partagent le même slug. Aller vers une autre contribution en est une.

Les taux ne sont pas stockés (valeurs dérivables, calculées dans Metabase) :
part d'entrée = ``nb_visites_contribution / nb_visites_total`` ; poursuite de
navigation = ``nb_visites_suite / nb_visites_contribution``.
"""

from __future__ import annotations

import re

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.reports._parcours import classify, query_pages

ENTRY_COLUMN = "nb_visites_contribution"

# ``/contribution/{premier}`` avec un éventuel second segment, avant requête ou
# ancre. La page liste ``/contribution`` seule n'a pas de slug.
_CONTRIBUTION_RE = re.compile(r"/contribution/([^/?#]+)(?:/([^/?#]+))?")
# Version personnalisée : le premier segment est préfixé de l'IDCC (4 chiffres).
_IDCC_PREFIX_RE = re.compile(r"^\d{4}-(.+)$")
_CONTRIBUTION_LIKE = "%/contribution/%"

_QUERY_PAGES = query_pages()


def contribution_slug(url: str) -> str | None:
    """Slug de la contribution d'une URL, ``None`` si ce n'est pas une contribution."""
    match = _CONTRIBUTION_RE.search(url)
    if not match:
        return None
    first, second = match.groups()
    if second is not None:
        # ``/contribution/{slug}/{idcc}-{nom}`` : le slug est le premier segment.
        return first
    prefixed = _IDCC_PREFIX_RE.match(first)
    return prefixed.group(1) if prefixed else first


def get_parcours_contributions(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Retourne les visites entrant par une contribution, et leur poursuite.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, referrer_type, slug,
        nb_visites_total, nb_visites_contribution, nb_visites_suite. Une ligne par
        (device, referrer_type, slug) ayant au moins une visite ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        pages = client.run_query_df(
            _QUERY_PAGES, (date, date, date, date, _CONTRIBUTION_LIKE)
        )
    return classify_events(pages)


def classify_events(pages: pd.DataFrame) -> pd.DataFrame:
    """Classe les visites et agrège par (device, référent, slug)."""
    return classify(pages, contribution_slug, ENTRY_COLUMN)
