"""Tests for the clarity widget suggestion verbatims (pure function, no I/O)."""

from __future__ import annotations

from datetime import UTC, datetime

import pandas as pd

from analysis.commands.ingest_suggestions_contributions import _rows_from_df
from analysis.reports.suggestions_contributions import extract_suggestions

BASE = "https://code.travail.gouv.fr"
SLUG = "quel-est-le-salaire-minimum"
CC_SLUG = "2264-les-conges-pour-evenements-familiaux"


def suggestion(
    text: str | None,
    slug: str = SLUG,
    os: str = "Windows",
    timestamp: datetime = datetime(2026, 11, 1, 10, 30, 0),  # noqa: B008
    category: str = "clarte_contribution_suggestion",
    action_type: str = "event",
) -> dict:
    return {
        "action_timestamp": timestamp,
        "operatingsystemname": os,
        "action_type": action_type,
        "action_url": f"{BASE}/contribution/{slug}",
        "action_eventcategory": category,
        "action_eventaction": text,
        "action_eventname": f"contribution/{slug}",
    }


def test_empty_gives_no_rows():
    df = extract_suggestions(pd.DataFrame())
    assert df.empty
    assert list(df.columns) == ["horodatage", "page", "device", "suggestion"]
    assert _rows_from_df(df, "2026-11-01") == []


def test_one_row_per_suggestion_with_page_device_and_text():
    df = extract_suggestions(
        pd.DataFrame(
            [
                suggestion("Ajoutez un exemple"),
                suggestion("Trop long", slug=CC_SLUG, os="iOS"),
                suggestion("Trop long", slug=CC_SLUG, os="Android"),
            ]
        )
    )
    assert df[["page", "device", "suggestion"]].to_dict("records") == [
        {"page": SLUG, "device": "desktop", "suggestion": "Ajoutez un exemple"},
        {"page": CC_SLUG, "device": "mobile", "suggestion": "Trop long"},
        {"page": CC_SLUG, "device": "mobile", "suggestion": "Trop long"},
    ]


def test_text_looking_like_an_action_is_still_a_verbatim():
    df = extract_suggestions(
        pd.DataFrame([suggestion("note_2"), suggestion("remarque")])
    )
    assert list(df["suggestion"]) == ["note_2", "remarque"]


def test_other_categories_and_empty_texts_are_ignored():
    df = extract_suggestions(
        pd.DataFrame(
            [
                suggestion("note_1", category="clarte_contribution"),
                suggestion("note_1", category="notation_contribution"),
                suggestion("Page vue", action_type="action"),
                suggestion(""),
                suggestion(None),
                suggestion("Gardé"),
            ]
        )
    )
    assert list(df["suggestion"]) == ["Gardé"]


def test_timestamp_is_naive_utc():
    df = extract_suggestions(
        pd.DataFrame(
            [
                suggestion("naive", timestamp=datetime(2026, 11, 1, 10, 30)),
                suggestion(
                    "aware", timestamp=datetime(2026, 11, 1, 10, 30, tzinfo=UTC)
                ),
            ]
        )
    )
    assert df["horodatage"].dt.tz is None
    assert df["horodatage"].tolist() == [pd.Timestamp("2026-11-01 10:30")] * 2


def test_rows_follow_insert_column_order():
    df = extract_suggestions(pd.DataFrame([suggestion("Merci", os="Android")]))
    assert _rows_from_df(df, "2026-11-01") == [
        (datetime(2026, 11, 1, 10, 30), "2026-11-01", SLUG, "mobile", "Merci")
    ]
