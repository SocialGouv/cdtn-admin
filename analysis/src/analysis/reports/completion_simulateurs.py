"""Calcul du taux de complétion des simulateurs via l'API Matomo.

Les appels HTTP à l'API Reporting de Matomo sont délégués à
:class:`~analysis.connectors.matomo_reporting.MatomoReportingConnector` afin
d'être centralisés et réutilisables. La configuration (URL de base, ``idSite``,
token d'auth) provient de ``ReportingSettings`` (fichier ``.env`` :
``MATOMO_BASE_URL`` / ``MATOMO_SITE_ID`` / ``MATOMO_TOKEN_AUTH``).
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo_reporting import MatomoReportingConnector

CONFIGS = [
    (
        "view_step_Indemnité de rupture conventionnelle",
        "indemnite-rupture-conventionnelle",
        "Indemnité de rupture conventionnelle",
        "start",
        "result",
    ),
    (
        "view_step_Indemnité de licenciement",
        "indemnite-licenciement",
        "Indemnité de licenciement",
        "start",
        "result",
    ),
    (
        "view_step_Préavis de démission",
        "preavis-demission",
        "Préavis de démission",
        "start",
        "result",
    ),
    (
        "view_step_Indemnité de précarité",
        "indemnite-precarite",
        "Indemnité de précarité",  # last step : indemnite
        "start",
        "indemnite",
    ),
    (
        "view_step_Préavis de licenciement",
        "preavis-licenciement",
        "Préavis de licenciement",
        "start",
        "results",
    ),
    (
        "view_step_Heures d'absence pour rechercher un emploi",
        "heures-recherche-emploi",
        "Heures d'absence pour rechercher un emploi",
        "start",
        "results",
    ),
    (
        "view_step_Préavis de départ ou de mise à la retraite",
        "preavis-retraite",
        "Préavis de départ ou de mise à la retraite",
        "intro",
        "result",
    ),
]

SEGMENTS = {
    "desktop": "deviceType==desktop",
    # « mobile » regroupe smartphones ET tablettes (`,` = OU dans un segment Matomo).
    "mobile": "deviceType==smartphone,deviceType==tablet",
}


def get_completion_simulateurs(
    date: str, matomo: MatomoReportingConnector | None = None
) -> pd.DataFrame:
    """Retourne le tableau de complétion des simulateurs pour une date donnée.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Connecteur Reporting Matomo à réutiliser. Si ``None``, un
            connecteur (et son client HTTP) est ouvert le temps de l'appel.

    Returns:
        DataFrame avec les colonnes : device, titre, visites, Start, Result.
        Le taux de complétion n'est pas stocké : il se déduit de Result / Start.
    """
    # Ouvre un unique connecteur (donc un unique client httpx) partagé par tous
    # les appels de la date, puis délègue au corps ci-dessous.
    if matomo is None:
        with MatomoReportingConnector() as client:
            return get_completion_simulateurs(date, client)

    rows = []
    for device, segment in SEGMENTS.items():
        # Collecte des patterns uniques pour limiter les appels API
        unique_patterns = {
            p for *_, start_p, result_p in CONFIGS for p in (start_p, result_p)
        }
        dfs = {
            p: _fetch_events_by_pattern(matomo, date, p, segment)
            for p in unique_patterns
        }

        for action, url_filter, titre, start_pattern, result_pattern in CONFIGS:
            r = _calcul_conversion(
                matomo,
                date,
                dfs[start_pattern],
                dfs[result_pattern],
                action,
                url_filter,
                segment,
                titre,
            )
            r["device"] = device
            rows.append(r)

    tableau = pd.DataFrame(rows)
    return tableau[["device", "titre", "visites", "Start", "Result"]]


# ---------------------------------------------------------------------------
# Fonctions internes
# ---------------------------------------------------------------------------


def _fetch_events_by_pattern(
    matomo: MatomoReportingConnector,
    date: str,
    filter_pattern: str,
    segment: str | None = None,
) -> pd.DataFrame:
    """Récupère les events Matomo correspondant à un filter_pattern donné."""
    data = matomo.get_events_action(
        date, filter_pattern=filter_pattern, segment=segment
    )
    return pd.json_normalize(data)


def _nb_visits(df: pd.DataFrame, action: str) -> int:
    """Lookup sécurisé : renvoie 0 si l'action est absente du DataFrame."""
    if df.empty or "Events_EventAction" not in df.columns:
        return 0
    m = df.loc[df["Events_EventAction"] == action, "nb_visits"]
    return int(m.iloc[0]) if not m.empty else 0


def _calcul_conversion(
    matomo: MatomoReportingConnector,
    date: str,
    df_start: pd.DataFrame,
    df_result: pd.DataFrame,
    action: str,
    url_filter: str,
    segment: str | None = None,
    titre: str | None = None,
) -> dict:
    data = matomo.get_page_urls(
        date, period="day", filter_pattern=url_filter, segment=segment, flat=True
    )
    df_visit = pd.json_normalize(data)
    # Un segment peu fréquenté (ex: mobile) peut ne renvoyer aucune ligne pour ce
    # simulateur : dans ce cas le total de visites vaut 0.
    if df_visit.empty or "nb_visits" not in df_visit.columns:
        total_visit = 0
    else:
        total_visit = pd.to_numeric(df_visit["nb_visits"], errors="coerce").sum()

    nb_start = _nb_visits(df_start, action)
    nb_result = _nb_visits(df_result, action)
    return {
        "titre": titre or action,
        "visites": total_visit,
        "Start": nb_start,
        "Result": nb_result,
    }
