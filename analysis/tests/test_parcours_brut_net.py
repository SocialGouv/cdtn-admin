"""Tests du parcours après le simulateur brut/net (fonction pure, sans I/O)."""

from __future__ import annotations

import pandas as pd

from analysis.reports.parcours_brut_net import classify_events

B = "https://code.travail.gouv.fr"
TOOL = "/outils/simulateur-embauche"


def page(visit: int, n: int, path: str, os: str = "Windows", ref: str = "search"):
    return {
        "idvisit": visit,
        "action_id": f"{visit}_{n}",
        "action_timestamp": pd.Timestamp("2026-10-01 10:00") + pd.Timedelta(seconds=n),
        "operatingsystemname": os,
        "referrertype": ref,
        "action_url": f"{B}{path}",
    }


def test_entree_suite_et_total():
    df = pd.DataFrame(
        [
            page(1, 0, TOOL),
            page(1, 1, "/contribution/x"),  # entrée + suite
            page(2, 0, TOOL),
            page(2, 1, f"{TOOL}?salaire=2000"),  # même chemin : pas de suite
            page(2, 2, f"{TOOL}/"),
            page(3, 0, "/outils/autre"),
            page(3, 1, TOOL),  # vu mais pas entré
            page(4, 0, TOOL, "iOS", "direct"),
        ]
    )
    out = classify_events(df).set_index(["device", "referrer_type"])
    assert out.loc[("desktop", "search")].to_dict() == {
        "nb_visites_total": 3,
        "nb_visites_entree": 2,
        "nb_visites_suite": 1,
    }
    assert out.loc[("mobile", "direct")]["nb_visites_entree"] == 1


def test_page_voisine_ignoree():
    df = pd.DataFrame([page(1, 0, f"{TOOL}-autre")])
    assert classify_events(df).empty
