"""Visites par type de contenu et par device (réplica SQL Matomo).

Pour chaque type de contenu du site et chaque device (desktop / mobile), compte des
**visites** (jamais des pages vues) ayant vu au moins une page de ce type. Une
visite qui consulte plusieurs types est comptée dans chacun : la somme des types
dépasse donc le nombre total de visites.

Le type vient du premier segment de l'URL (``https://code.travail.gouv.fr/{route}/…``),
selon la table ``routeBySource`` de ``@socialgouv/cdtn-utils`` (reprise dans
``ROUTES`` ; ce package est en JavaScript, on ne peut pas l'importer). Cas
particuliers :

* ``/`` → ``home`` ;
* ``/{route}`` seul (page qui recense les contenus du type, ex. ``/contribution``)
  → ``home-{route}`` ;
* ``/politique-confidentialite`` → ``politique-confidentialite`` ;
* toute autre URL → ``autre``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import device_from_os

_COLUMNS = ["device", "content_type", "nb_visites"]

# ``routeBySource`` de @socialgouv/cdtn-utils (build/sources.js) : routes du site.
ROUTES: list[str] = [
    "convention-collective",
    "code-du-travail",
    "contribution",
    "information",
    "external",
    "glossaire",
    "droit-du-travail",
    "modeles-de-courriers",
    "fiche-ministere-travail",
    "fiche-service-public",
    "dossiers",
    "themes",
    "outils",
    "highlights",
    "prequalified",
    "infographie",
    "quoi-de-neuf",
    "actualite",
]

# Pages liste dont l'URL n'est pas la route du type (``/actualites`` → ``actualite``).
LISTING_ALIASES: dict[str, str] = {"actualites": "actualite"}

# Pages hors ``routeBySource`` conservées comme type à part.
STANDALONE_PAGES: list[str] = ["politique-confidentialite"]

_OTHER = "autre"
_HOME = "home"

# Chemin de l'URL puis premier segment (``seg``) et le suivant (``rest``). Une URL
# sans chemin (``https://host``) vaut ``/``.
_QUERY = """
WITH pages AS (
    SELECT
        idvisit,
        operatingsystemname,
        COALESCE(substring(action_url from 'https?://[^/]+(/[^?#]*)'), '/') AS path
    FROM matomo_partitioned
    WHERE action_timestamp >= %s
      AND action_timestamp < %s::date + 1
      AND action_type = 'action'
),
typed AS (
    SELECT
        idvisit,
        operatingsystemname,
        split_part(path, '/', 2) AS seg,
        split_part(path, '/', 3) AS rest
    FROM pages
)
SELECT
    operatingsystemname,
    seg,
    (rest = '') AS is_listing,
    COUNT(DISTINCT idvisit) AS nb_visites
FROM typed
GROUP BY operatingsystemname, seg, (rest = '');
"""


def get_visites_par_type_contenu(
    date: str, matomo: object | None = None
) -> pd.DataFrame:
    """Retourne les visites par type de contenu et device pour une date donnée.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, content_type, nb_visites. Une ligne
        par (device, type) ayant au moins une visite ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        counts = client.run_query_df(_QUERY, (date, date))
    return classify_counts(counts)


def content_type(seg: str, is_listing: bool) -> str:
    """Type de contenu d'une page d'après son premier segment d'URL.

    Args:
        seg: premier segment du chemin (vide pour la page d'accueil).
        is_listing: vrai si le chemin n'a pas de second segment (``/{seg}``).
    """
    if not seg:
        return _HOME
    seg = LISTING_ALIASES.get(seg, seg) if is_listing else seg
    if seg in ROUTES:
        return f"{_HOME}-{seg}" if is_listing else seg
    if seg in STANDALONE_PAGES:
        return seg
    return _OTHER


def classify_counts(counts: pd.DataFrame) -> pd.DataFrame:
    """Rattache les décomptes (OS, segment) à un (device, type) et les somme.

    Fonction pure (sans I/O), séparée de la requête pour être testable. Les visites
    étant comptées distinctes par (OS, segment), la somme reste exacte tant qu'un
    type ne regroupe pas plusieurs segments d'une même visite : seul ``autre`` peut
    en regrouper (léger sur-comptage possible).

    Args:
        counts: décomptes avec les colonnes ``operatingsystemname``, ``seg``,
            ``is_listing`` et ``nb_visites``.
    """
    if counts.empty:
        return pd.DataFrame(columns=_COLUMNS)

    typed = pd.DataFrame(
        {
            "device": counts["operatingsystemname"].map(device_from_os),
            "content_type": [
                content_type(seg or "", bool(listing))
                for seg, listing in zip(
                    counts["seg"], counts["is_listing"], strict=True
                )
            ],
            "nb_visites": counts["nb_visites"].astype(int),
        }
    )
    return typed.groupby(["device", "content_type"], as_index=False).sum()
