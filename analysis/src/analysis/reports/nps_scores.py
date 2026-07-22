"""Scores NPS du CDTN par device et par page, via l'API Matomo.

Le widget de feedback du site émet un event Matomo ``score_{0..10}`` dont le nom
(``Events_EventName``) porte le chemin de la page notée (ex.
``contribution/quel-est-le-salaire-minimum``). Ce report récupère ces events
(``Events.getAction``, ``filter_pattern="score_"``) pour une journée, les ventile
par device (desktop / mobile, cf. ``DEVICE_SEGMENTS``) et compte les visiteurs
uniques par (score, page).

Le score NPS lui-même (promoteurs 9-10, détracteurs 0-6) n'est pas calculé ici :
il se déduit des lignes stockées, Metabase le recalcule.

Les appels HTTP sont délégués à
:class:`~analysis.connectors.matomo_reporting.MatomoReportingConnector`.
"""

from __future__ import annotations

import re

import pandas as pd

from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.matomo_segments import DEVICE_SEGMENTS

# Actions retenues : strictement ``score_<n>``. Le ``filter_pattern`` envoyé à
# Matomo est une simple sous-chaîne ("score_") ; ce motif strict écarte côté
# client toute autre action qui contiendrait "score_".
_SCORE_EVENT_RE = re.compile(r"^score_(\d{1,2})$")

_COLUMNS = ["device", "score", "url", "nb_uniq_visitors"]


def get_nps_scores(
    date: str, matomo: MatomoReportingConnector | None = None
) -> pd.DataFrame:
    """Retourne les visiteurs uniques par (device, score, page) pour une date.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Connecteur Reporting Matomo à réutiliser. Si ``None``, un
            connecteur (et son client HTTP) est ouvert le temps de l'appel.

    Returns:
        DataFrame avec les colonnes : device, score (entier 0-10), url (chemin
        de la page notée), nb_uniq_visitors. Une ligne par (device, score, url)
        ayant reçu au moins un vote ce jour-là.
    """
    if matomo is None:
        with MatomoReportingConnector() as client:
            return get_nps_scores(date, client)

    parts = []
    for device, segment in DEVICE_SEGMENTS.items():
        part = _fetch_scores_for_segment(matomo, date, segment)
        part.insert(0, "device", device)
        parts.append(part)
    return pd.concat(parts, ignore_index=True)[_COLUMNS]


# ---------------------------------------------------------------------------
# Fonctions internes
# ---------------------------------------------------------------------------


def _fetch_scores_for_segment(
    matomo: MatomoReportingConnector, date: str, segment: str
) -> pd.DataFrame:
    """Visiteurs uniques par (score, url) pour un segment device donné.

    Un segment sans trafic (ou sans vote) renvoie un DataFrame vide mais avec
    les bonnes colonnes, pour que la concaténation reste homogène.
    """
    data = matomo.get_events_action(date, filter_pattern="score_", segment=segment)
    df = pd.json_normalize(data)
    empty = pd.DataFrame(columns=["score", "url", "nb_uniq_visitors"])
    if df.empty or "Events_EventAction" not in df.columns:
        return empty

    # Parse le score entier depuis l'action (``score_10`` -> 10) ; écarte les
    # actions hors motif et les events sans nom de page.
    df["score"] = pd.to_numeric(
        df["Events_EventAction"].str.extract(_SCORE_EVENT_RE)[0], errors="coerce"
    )
    if "Events_EventName" not in df.columns:
        return empty
    df = df.dropna(subset=["score", "Events_EventName"])
    if df.empty:
        return empty
    df["score"] = df["score"].astype(int)
    df["nb_uniq_visitors"] = (
        pd.to_numeric(df["nb_uniq_visitors"], errors="coerce").fillna(0).astype(int)
    )

    return (
        df.groupby(["score", "Events_EventName"], as_index=False)["nb_uniq_visitors"]
        .sum()
        .rename(columns={"Events_EventName": "url"})
    )
