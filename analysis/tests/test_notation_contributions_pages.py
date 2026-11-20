"""Tests for the per-contribution clarity rating aggregation (pure, no I/O)."""

from __future__ import annotations

import pandas as pd
import pytest

from analysis.reports.notation_contributions_pages import (
    COUNT_COLUMNS,
    aggregate_pages,
    page_from_url,
)

BASE = "https://code.travail.gouv.fr"
SLUG = "quel-est-le-salaire-minimum"
CC_SLUG = "2264-les-conges-pour-evenements-familiaux"


def page(visit: int, path: str) -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": "Windows",
        "action_type": "action",
        "action_url": f"{BASE}{path}",
        "action_eventcategory": None,
        "action_eventaction": None,
        "action_eventname": None,
    }


def event(
    visit: int,
    action: str | None,
    slug: str = SLUG,
    category: str = "clarte_contribution",
) -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": "Android",
        "action_type": "event",
        "action_url": f"{BASE}/contribution/{slug}",
        "action_eventcategory": category,
        "action_eventaction": action,
        "action_eventname": f"contribution/{slug}",
    }


def by_page(df: pd.DataFrame) -> dict[str, dict]:
    return {r["page"]: r for r in df.to_dict("records")}


@pytest.mark.parametrize(
    ("path", "expected"),
    [
        (f"/contribution/{SLUG}", SLUG),
        (f"/contribution/{SLUG}/", SLUG),
        (f"/contribution/{SLUG}?utm_source=x", SLUG),
        (f"/contribution/{SLUG}#contenu", SLUG),
        (f"/contribution/{CC_SLUG}", CC_SLUG),
        (f"/contribution/{CC_SLUG}?q=1#retour", CC_SLUG),
        (
            "/contribution/les-conges-pour-evenements-familiaux/2264-personnel-des-agences",
            CC_SLUG,
        ),
        ("/contribution/les-conges-pour-evenements-familiaux/2264", CC_SLUG),
        ("/contribution", None),
        ("/contribution/", None),
        ("/contribution?q=conges", None),
        ("/fiche-service-public/conges", None),
    ],
)
def test_page_from_url(path, expected):
    assert page_from_url(f"{BASE}{path}") == expected


def test_page_from_missing_url():
    assert page_from_url(None) is None


def test_empty_gives_no_rows():
    df = aggregate_pages(pd.DataFrame())
    assert df.empty
    assert list(df.columns) == ["page", *COUNT_COLUMNS]


def test_counts_visits_once_per_page():
    df = aggregate_pages(
        pd.DataFrame(
            [
                page(1, f"/contribution/{SLUG}"),
                page(1, f"/contribution/{SLUG}#contenu"),
                page(1, f"/contribution/{CC_SLUG}"),
                page(2, f"/contribution/{SLUG}?q=1"),
                page(3, "/contribution"),
            ]
        )
    )
    pages = by_page(df)
    assert set(pages) == {SLUG, CC_SLUG}
    assert pages[SLUG]["nb_visites"] == 2
    assert pages[CC_SLUG]["nb_visites"] == 1


def test_counts_every_action_per_page():
    actions = {
        "note_1": "nb_notes_1",
        "note_2": "nb_notes_2",
        "note_3": "nb_notes_3",
        "raison_texte_difficile": "nb_raisons_texte_difficile",
        "raison_applicable_situation": "nb_raisons_applicable_situation",
        "raison_comment_appliquer": "nb_raisons_comment_appliquer",
        "raison_informations_fausses": "nb_raisons_informations_fausses",
        "remarque": "nb_remarques",
    }
    rows = [event(10, action) for action in actions]
    rows += [event(11, "note_3", slug=CC_SLUG), event(12, "note_3", slug=CC_SLUG)]
    rows += [
        event(13, "Ajoutez un exemple", category="clarte_contribution_suggestion"),
        # A suggestion that looks like an action is still a suggestion.
        event(14, "note_2", slug=CC_SLUG, category="clarte_contribution_suggestion"),
    ]
    pages = by_page(aggregate_pages(pd.DataFrame(rows)))

    generic = pages[SLUG]
    for column in actions.values():
        assert generic[column] == 1, column
    assert generic["nb_suggestions"] == 1
    assert generic["nb_visites"] == 0

    cc = pages[CC_SLUG]
    assert cc["nb_notes_3"] == 2
    assert cc["nb_notes_2"] == 0
    assert cc["nb_suggestions"] == 1


def test_event_page_falls_back_to_url_without_name():
    row = event(10, "note_1")
    row["action_eventname"] = None
    pages = by_page(aggregate_pages(pd.DataFrame([row])))
    assert pages[SLUG]["nb_notes_1"] == 1


def test_event_name_variant_suffix_is_stripped():
    row = event(10, "note_1")
    row["action_eventname"] = f"contribution/{SLUG}|variant=original"
    assert list(aggregate_pages(pd.DataFrame([row]))["page"]) == [SLUG]


def test_zero_only_pages_and_other_categories_are_dropped():
    df = aggregate_pages(
        pd.DataFrame(
            [
                # Historical 5-point scale and unknown categories: ignored.
                event(10, "note_1", slug="ancienne", category="notation_contribution"),
                event(11, "note_1", slug="inconnue", category="autre_categorie"),
                # Unknown action of the clarity category: ignored.
                event(12, "note_5", slug="note-inconnue"),
                event(13, None, slug="sans-action"),
                event(14, "note_2"),
            ]
        )
    )
    assert list(df["page"]) == [SLUG]
    r = df.iloc[0]
    assert sum(r[column] for column in COUNT_COLUMNS) == 1
    assert r["nb_notes_2"] == 1


def test_values_are_plain_ints():
    df = aggregate_pages(
        pd.DataFrame([page(1, f"/contribution/{SLUG}"), event(2, "remarque")])
    )
    assert (df[COUNT_COLUMNS].dtypes == "int64").all()
    assert df.iloc[0][["nb_visites", "nb_remarques"]].tolist() == [1, 1]
