"""Tests for the contribution clarity rating aggregation (pure function, no I/O)."""

from __future__ import annotations

import pandas as pd

from analysis.commands.ingest_notation_contributions import _rows_from_df
from analysis.reports.notation_contributions import aggregate_events

BASE = "https://code.travail.gouv.fr"
SLUG = "quel-est-le-salaire-minimum"

REASON_COLUMNS = [
    "nb_raisons_texte_difficile",
    "nb_raisons_applicable_situation",
    "nb_raisons_comment_appliquer",
    "nb_raisons_informations_fausses",
]
EVENT_COLUMNS = [
    "nb_notes_1",
    "nb_notes_2",
    "nb_notes_3",
    *REASON_COLUMNS,
    "nb_remarques",
]


def page(visit: int, path: str, os: str = "Windows") -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": os,
        "action_type": "action",
        "action_url": f"{BASE}{path}",
        "action_eventcategory": None,
        "action_eventaction": None,
    }


def event(
    visit: int,
    action: str,
    os: str = "Windows",
    category: str = "clarte_contribution",
) -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": os,
        "action_type": "event",
        "action_url": f"{BASE}/contribution/{SLUG}",
        "action_eventcategory": category,
        "action_eventaction": action,
    }


def rating(visit: int, score: int | str, os: str = "Windows") -> dict:
    return event(visit, f"note_{score}", os=os)


def row(df: pd.DataFrame, device: str = "desktop") -> dict:
    sel = df[df["device"] == device]
    assert len(sel) == 1
    return sel.iloc[0].to_dict()


def test_empty_gives_zero_row_for_every_device():
    df = aggregate_events(pd.DataFrame())
    assert sorted(df["device"]) == ["desktop", "mobile"]
    assert list(df.columns) == ["device", "nb_visites_contributions", *EVENT_COLUMNS]
    assert (df.drop(columns=["device"]) == 0).all().all()


def test_counts_visits_once_and_ratings_per_score():
    df = aggregate_events(
        pd.DataFrame(
            [
                page(1, f"/contribution/{SLUG}"),
                page(1, f"/contribution/{SLUG}#contenu"),
                page(2, f"/contribution/{SLUG}/syntec"),
                page(3, "/contribution/2264-les-conges-pour-evenements-familiaux"),
                rating(10, 3),
                rating(11, 3),
                rating(12, 1),
            ]
        )
    )
    r = row(df)
    assert r["nb_visites_contributions"] == 3
    assert r["nb_notes_1"] == 1
    assert r["nb_notes_2"] == 0
    assert r["nb_notes_3"] == 2


def test_counts_reasons_and_remarks():
    df = aggregate_events(
        pd.DataFrame(
            [
                rating(10, 1),
                event(10, "raison_texte_difficile"),
                event(10, "raison_informations_fausses"),
                rating(11, 2),
                event(11, "raison_texte_difficile"),
                event(11, "raison_applicable_situation"),
                event(11, "raison_comment_appliquer"),
                event(12, "remarque"),
                event(13, "remarque"),
            ]
        )
    )
    r = row(df)
    assert r["nb_notes_1"] == r["nb_notes_2"] == 1
    assert r["nb_raisons_texte_difficile"] == 2
    assert r["nb_raisons_applicable_situation"] == 1
    assert r["nb_raisons_comment_appliquer"] == 1
    assert r["nb_raisons_informations_fausses"] == 1
    assert r["nb_remarques"] == 2


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


def test_device_split_for_visits_and_events():
    df = aggregate_events(
        pd.DataFrame(
            [
                page(1, f"/contribution/{SLUG}", os="Android"),
                page(2, f"/contribution/{SLUG}", os="Mac"),
                rating(10, 1, os="iOS"),
                event(10, "raison_texte_difficile", os="iOS"),
                rating(11, 3, os="Windows"),
                event(12, "remarque", os="Windows"),
            ]
        )
    )
    mobile, desktop = row(df, "mobile"), row(df, "desktop")
    assert mobile["nb_visites_contributions"] == 1
    assert mobile["nb_notes_1"] == 1
    assert mobile["nb_raisons_texte_difficile"] == 1
    assert mobile["nb_remarques"] == 0
    assert desktop["nb_visites_contributions"] == 1
    assert desktop["nb_notes_3"] == 1
    assert desktop["nb_raisons_texte_difficile"] == 0
    assert desktop["nb_remarques"] == 1


def test_unexpected_actions_are_ignored():
    df = aggregate_events(
        pd.DataFrame(
            [
                rating(10, 0),
                rating(11, 4),
                rating(12, 5),
                rating(13, "x"),
                event(14, "raison_autre"),
                event(15, "remarques"),
                event(16, None),
                rating(17, 2),
            ]
        )
    )
    r = row(df)
    assert sum(r[column] for column in EVENT_COLUMNS) == 1
    assert r["nb_notes_2"] == 1


def test_other_categories_are_ignored():
    df = aggregate_events(
        pd.DataFrame(
            [
                # Historical 5-point scale: never mixed with the 3-point one.
                event(10, "note_1", category="notation_contribution"),
                event(11, "note_5", category="notation_contribution"),
                # Free-text suggestion: not ingested.
                event(12, "remarque", category="clarte_contribution_suggestion"),
                event(13, "note_2", category="clarte_contribution_suggestion"),
                rating(14, 3),
            ]
        )
    )
    r = row(df)
    assert sum(r[column] for column in EVENT_COLUMNS) == 1
    assert r["nb_notes_3"] == 1


def test_rows_follow_upsert_column_order():
    df = aggregate_events(
        pd.DataFrame(
            [
                page(1, f"/contribution/{SLUG}"),
                rating(2, 2),
                event(2, "raison_comment_appliquer"),
                event(3, "remarque"),
            ]
        )
    )
    rows = _rows_from_df(df, "2026-11-01")
    assert ("2026-11-01", "desktop", 1, 0, 1, 0, 0, 0, 1, 0, 1) in rows
    assert ("2026-11-01", "mobile", 0, 0, 0, 0, 0, 0, 0, 0, 0) in rows
    assert all(len(r) == 11 for r in rows)
