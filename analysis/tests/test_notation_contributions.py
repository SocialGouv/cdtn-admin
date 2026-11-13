"""Tests for the contribution rating aggregation (pure function, no I/O)."""

from __future__ import annotations

import pandas as pd

from analysis.commands.ingest_notation_contributions import _rows_from_df
from analysis.reports.notation_contributions import aggregate_events

BASE = "https://code.travail.gouv.fr"
SLUG = "quel-est-le-salaire-minimum"


def page(visit: int, path: str, os: str = "Windows") -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": os,
        "action_type": "action",
        "action_url": f"{BASE}{path}",
        "action_eventaction": None,
    }


def rating(visit: int, score: int | str, os: str = "Windows") -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": os,
        "action_type": "event",
        "action_url": f"{BASE}/contribution/{SLUG}",
        "action_eventaction": f"note_{score}",
    }


def row(df: pd.DataFrame, device: str = "desktop") -> dict:
    sel = df[df["device"] == device]
    assert len(sel) == 1
    return sel.iloc[0].to_dict()


def test_empty_gives_zero_row_for_every_device():
    df = aggregate_events(pd.DataFrame())
    assert sorted(df["device"]) == ["desktop", "mobile"]
    assert (df.drop(columns=["device"]) == 0).all().all()


def test_counts_visits_once_and_ratings_per_score():
    df = aggregate_events(
        pd.DataFrame(
            [
                page(1, f"/contribution/{SLUG}"),
                page(1, f"/contribution/{SLUG}#contenu"),
                page(2, f"/contribution/{SLUG}/syntec"),
                page(3, "/contribution/2264-les-conges-pour-evenements-familiaux"),
                rating(10, 4),
                rating(11, 4),
                rating(12, 1),
            ]
        )
    )
    r = row(df)
    assert r["nb_visites_contributions"] == 3
    assert r["nb_notes_1"] == 1
    assert r["nb_notes_4"] == 2
    assert r["nb_notes_2"] == r["nb_notes_3"] == r["nb_notes_5"] == 0


def test_contribution_index_page_is_not_a_contribution_visit():
    df = aggregate_events(
        pd.DataFrame(
            [
                page(1, "/contribution"),
                page(2, "/contribution/"),
                page(3, "/contribution?q=conges"),
            ]
        )
    )
    assert row(df)["nb_visites_contributions"] == 0


def test_device_split_for_visits_and_ratings():
    df = aggregate_events(
        pd.DataFrame(
            [
                page(1, f"/contribution/{SLUG}", os="Android"),
                page(2, f"/contribution/{SLUG}", os="Mac"),
                rating(10, 5, os="iOS"),
                rating(11, 3, os="Windows"),
            ]
        )
    )
    mobile, desktop = row(df, "mobile"), row(df, "desktop")
    assert mobile["nb_visites_contributions"] == 1
    assert mobile["nb_notes_5"] == 1
    assert desktop["nb_visites_contributions"] == 1
    assert desktop["nb_notes_3"] == 1


def test_unexpected_rating_actions_are_ignored():
    df = aggregate_events(
        pd.DataFrame([rating(10, 0), rating(11, 6), rating(12, "x"), rating(13, 2)])
    )
    r = row(df)
    assert sum(r[f"nb_notes_{score}"] for score in range(1, 6)) == 1
    assert r["nb_notes_2"] == 1


def test_rows_follow_upsert_column_order():
    df = aggregate_events(
        pd.DataFrame([page(1, f"/contribution/{SLUG}"), rating(2, 5)])
    )
    rows = _rows_from_df(df, "2026-11-01")
    assert ("2026-11-01", "desktop", 1, 0, 0, 0, 0, 1) in rows
    assert ("2026-11-01", "mobile", 0, 0, 0, 0, 0, 0) in rows
    assert all(len(r) == 8 for r in rows)
