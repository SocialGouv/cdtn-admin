"""Tests de l'ordonnancement des actions d'une visite (fonction pure)."""

from __future__ import annotations

import pandas as pd

from analysis.reports.completion_modeles_courrier import classify_events
from analysis.visit_order import with_position


def ev(n: int, ts: str, action_type: str, url: str = "https://x/y") -> dict:
    return {
        "idvisit": 1,
        "action_id": f"1_{n}",
        "action_timestamp": pd.Timestamp(ts),
        "operatingsystemname": "Windows",
        "action_type": action_type,
        "action_url": url,
        "action_eventcategory": None,
        "action_eventaction": None,
    }


def test_position_ordre_numerique_a_horodatage_egal():
    df = pd.DataFrame(
        [ev(10, "2026-10-01 10:00", "action"), ev(2, "2026-10-01 10:00", "action")]
    )
    assert list(with_position(df)["action_id"]) == ["1_2", "1_10"]


def test_download_apres_modele_compte_malgre_actions_constant():
    page = "https://code.travail.gouv.fr/modeles-de-courriers/abc"
    df = pd.DataFrame(
        [
            ev(0, "2026-10-01 10:00:00", "action", page),
            ev(1, "2026-10-01 10:00:05", "download"),
        ]
    ).assign(actions="2")
    out = classify_events(df)
    assert out.loc[0, "nb_download"] == 1
