"""Tests de la classification des visites (fonction pure, sans I/O)."""

from __future__ import annotations

import pandas as pd

from analysis.reports.taux_contributions import classify_events

SLUG = "quel-est-le-salaire-minimum"
SLUGS = [SLUG, "autre-contribution"]
BASE = "https://code.travail.gouv.fr/contribution"

CC = "click_afficher_les_informations_CC"
NON_TRAITEE = "click_afficher_les_informations_générales"
SANS_CC = "click_afficher_les_informations_sans_CC"


def page(visit: int, url: str, os: str = "Windows") -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": os,
        "action_type": "action",
        "action_url": url,
        "action_eventaction": None,
        "action_eventname": None,
    }


def click(visit: int, action: str, name: str = f"contribution/{SLUG}") -> dict:
    return {
        "idvisit": visit,
        "operatingsystemname": "Windows",
        "action_type": "event",
        "action_url": f"{BASE}/{SLUG}",
        "action_eventaction": action,
        "action_eventname": name,
    }


def row(df: pd.DataFrame, device: str = "desktop", slug: str = SLUG) -> dict:
    sel = df[(df["device"] == device) & (df["slug"] == slug)]
    assert len(sel) == 1
    return sel.iloc[0].to_dict()


def run(rows: list[dict]) -> pd.DataFrame:
    return classify_events(pd.DataFrame(rows), SLUGS)


def test_empty_gives_zero_rows_for_every_device_and_slug():
    df = classify_events(pd.DataFrame(), SLUGS)
    assert len(df) == 4
    assert (df.drop(columns=["device", "slug"]) == 0).all().all()


def test_each_case_counted_in_its_own_column():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}"),
            click(1, CC),
            page(2, f"{BASE}/{SLUG}"),
            click(2, NON_TRAITEE),
            page(3, f"{BASE}/{SLUG}"),
            click(3, SANS_CC),
            page(4, f"{BASE}/{SLUG}"),
        ]
    )
    r = row(df)
    assert r["nb_visites_total"] == 4
    assert r["nb_visites_cc"] == 1
    assert r["nb_visites_cdt_cc_non_traitee"] == 1
    assert r["nb_visites_cdt"] == 1


def test_priority_cc_then_non_traitee_then_cdt():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}"),
            click(1, SANS_CC),
            click(1, NON_TRAITEE),
            click(1, CC),
            page(2, f"{BASE}/{SLUG}"),
            click(2, SANS_CC),
            click(2, NON_TRAITEE),
        ]
    )
    r = row(df)
    assert r["nb_visites_cc"] == 1
    assert r["nb_visites_cdt_cc_non_traitee"] == 1
    assert r["nb_visites_cdt"] == 0


def test_repeated_clicks_and_page_views_count_once():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}"),
            page(1, f"{BASE}/{SLUG}#contenu"),
            click(1, CC),
            click(1, CC),
        ]
    )
    r = row(df)
    assert r["nb_visites_total"] == 1
    assert r["nb_visites_cc"] == 1


def test_visit_without_generic_page_is_excluded():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}/1388-convention"),
            page(1, f"{BASE}/1388-{SLUG}"),
            click(1, CC),
        ]
    )
    r = row(df)
    assert r["nb_visites_total"] == 0
    assert r["nb_visites_cc"] == 0


def test_generic_page_seen_after_entering_on_cc_page_is_counted():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}/1388-convention"),
            page(1, f"{BASE}/{SLUG}?foo=bar"),
            click(1, CC),
        ]
    )
    r = row(df)
    assert r["nb_visites_total"] == 1
    assert r["nb_visites_cc"] == 1


def test_device_is_mobile_if_any_event_is_mobile():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}", os="iOS"),
            click(1, SANS_CC),
            page(2, f"{BASE}/{SLUG}"),
        ]
    )
    mobile, desktop = row(df, "mobile"), row(df, "desktop")
    assert mobile["nb_visites_total"] == 1
    assert mobile["nb_visites_cdt"] == 1
    assert desktop["nb_visites_total"] == 1
    assert desktop["nb_visites_cdt"] == 0


def test_untracked_slug_and_click_without_slug_are_ignored():
    df = run(
        [
            page(1, f"{BASE}/hors-perimetre"),
            click(1, CC, name="contribution/hors-perimetre"),
            page(2, f"{BASE}/{SLUG}"),
            click(2, CC, name="sans-rapport"),
        ]
    )
    r = row(df)
    assert r["nb_visites_total"] == 1
    assert r["nb_visites_cc"] == 0
    assert len(df) == 4


def test_event_name_with_variant_suffix_is_attributed_to_slug():
    df = run(
        [
            page(1, f"{BASE}/{SLUG}"),
            click(1, CC, name=f"/contribution/{SLUG}|variant=original"),
            page(2, f"{BASE}/{SLUG}"),
            click(2, SANS_CC, name=f"/contribution/{SLUG}|variant=radio_button"),
        ]
    )
    r = row(df)
    assert r["nb_visites_cc"] == 1
    assert r["nb_visites_cdt"] == 1
