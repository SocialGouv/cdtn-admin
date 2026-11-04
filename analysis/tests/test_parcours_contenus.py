"""Tests des parcours contributions / fiches SP (fonctions pures, sans I/O)."""

from __future__ import annotations

import pandas as pd
import pytest

from analysis.reports.parcours_contributions import (
    classify_events as classify_contributions,
)
from analysis.reports.parcours_contributions import contribution_slug
from analysis.reports.parcours_fiches_sp import (
    classify_events as classify_fiches,
)
from analysis.reports.parcours_fiches_sp import fiche_sp_slug

BASE = "https://code.travail.gouv.fr"
SLUG = "la-periode-dessai"
GENERIC = f"{BASE}/contribution/{SLUG}"
CC = f"{BASE}/contribution/1486-{SLUG}"
CC_2 = f"{BASE}/contribution/0016-{SLUG}"
OTHER = f"{BASE}/contribution/1486-le-preavis"
CONGES_SLUG = "les-conges-pour-evenements-familiaux"
CONGES = f"{BASE}/contribution/{CONGES_SLUG}"
CONGES_CC = f"{CONGES}/1486-bureaux-etudes-techniques"
FICHE = f"{BASE}/fiche-service-public/conges-payes"
OUTIL = f"{BASE}/outils/simulateur"


def visit(
    idvisit: int,
    urls: list[str],
    os: str = "Windows",
    referrer: str | None = "search",
) -> list[dict]:
    return [
        {
            "idvisit": idvisit,
            "actions": i + 1,
            "action_id": 100 * idvisit + i,
            "operatingsystemname": os,
            "referrertype": referrer,
            "action_url": url,
        }
        for i, url in enumerate(urls)
    ]


def frame(*visits: list[dict]) -> pd.DataFrame:
    return pd.DataFrame([p for v in visits for p in v])


def row(
    df: pd.DataFrame,
    slug: str,
    device: str = "desktop",
    referrer: str = "search",
) -> dict:
    sel = df[
        (df["device"] == device)
        & (df["referrer_type"] == referrer)
        & (df["slug"] == slug)
    ]
    assert len(sel) == 1
    return sel.iloc[0].to_dict()


def contrib(*visits: list[dict]) -> pd.DataFrame:
    return classify_contributions(frame(*visits))


# --- extraction des slugs -----------------------------------------------------


@pytest.mark.parametrize(
    ("url", "slug"),
    [
        (GENERIC, SLUG),
        (f"{GENERIC}/", SLUG),
        (f"{GENERIC}?foo=1#bar", SLUG),
        (CC, SLUG),
        (CONGES, CONGES_SLUG),
        (CONGES_CC, CONGES_SLUG),
        (f"{BASE}/contribution", None),
        (f"{BASE}/contribution/", None),
        (FICHE, None),
        (OUTIL, None),
    ],
)
def test_contribution_slug(url, slug):
    assert contribution_slug(url) == slug


@pytest.mark.parametrize(
    ("url", "slug"),
    [
        (FICHE, "conges-payes"),
        (f"{FICHE}/", "conges-payes"),
        (f"{FICHE}?a=1#b", "conges-payes"),
        (f"{BASE}/fiche-service-public", None),
        (GENERIC, None),
    ],
)
def test_fiche_sp_slug(url, slug):
    assert fiche_sp_slug(url) == slug


# --- contributions ------------------------------------------------------------


def test_empty_gives_empty_frame():
    assert classify_contributions(pd.DataFrame()).empty
    assert classify_fiches(pd.DataFrame()).empty


def test_columns_follow_parcours_actualites_syntax():
    out = contrib(visit(1, [GENERIC]))
    assert list(out.columns) == [
        "device",
        "referrer_type",
        "slug",
        "nb_visites_total",
        "nb_visites_contribution",
        "nb_visites_suite",
    ]
    out = classify_fiches(frame(visit(1, [FICHE])))
    assert list(out.columns) == [
        "device",
        "referrer_type",
        "slug",
        "nb_visites_total",
        "nb_visites_fiche_sp",
        "nb_visites_suite",
    ]


def test_entry_then_other_page_is_continuation():
    r = row(contrib(visit(1, [GENERIC, OUTIL])), SLUG)
    assert (r["nb_visites_total"], r["nb_visites_contribution"]) == (1, 1)
    assert r["nb_visites_suite"] == 1


def test_single_page_is_not_continuation():
    r = row(contrib(visit(1, [GENERIC])), SLUG)
    assert (r["nb_visites_contribution"], r["nb_visites_suite"]) == (1, 0)


def test_reload_is_not_continuation():
    r = row(contrib(visit(1, [GENERIC, GENERIC, f"{GENERIC}#ancre"])), SLUG)
    assert r["nb_visites_suite"] == 0


@pytest.mark.parametrize(
    ("entry", "later", "slug"),
    [
        (GENERIC, CC, SLUG),
        (CC, GENERIC, SLUG),
        (CC, CC_2, SLUG),
        (CONGES, CONGES_CC, CONGES_SLUG),
        (CONGES_CC, CONGES, CONGES_SLUG),
    ],
)
def test_generic_cc_switch_is_not_continuation(entry, later, slug):
    r = row(contrib(visit(1, [entry, later])), slug)
    assert (r["nb_visites_contribution"], r["nb_visites_suite"]) == (1, 0)


def test_switch_then_other_page_is_continuation():
    r = row(contrib(visit(1, [GENERIC, CC, OUTIL])), SLUG)
    assert r["nb_visites_suite"] == 1


def test_other_contribution_is_continuation_and_counted_in_total():
    out = contrib(visit(1, [GENERIC, OTHER]))
    assert row(out, SLUG)["nb_visites_suite"] == 1
    # La visite a aussi vu l'autre contribution, sans y entrer.
    other = row(out, "le-preavis")
    assert (other["nb_visites_total"], other["nb_visites_contribution"]) == (1, 0)
    assert other["nb_visites_suite"] == 0


def test_list_page_after_entry_is_continuation():
    r = row(contrib(visit(1, [GENERIC, f"{BASE}/contribution"])), SLUG)
    assert r["nb_visites_suite"] == 1


def test_not_first_page_counts_in_total_only():
    r = row(contrib(visit(1, [OUTIL, GENERIC, OUTIL])), SLUG)
    assert (r["nb_visites_total"], r["nb_visites_contribution"]) == (1, 0)
    assert r["nb_visites_suite"] == 0


def test_return_to_entry_after_other_page_is_continuation():
    r = row(contrib(visit(1, [GENERIC, OUTIL, GENERIC])), SLUG)
    assert r["nb_visites_suite"] == 1


def test_visit_counted_once_with_many_later_pages():
    r = row(contrib(visit(1, [GENERIC, OUTIL, f"{BASE}/b", OTHER])), SLUG)
    assert (r["nb_visites_total"], r["nb_visites_suite"]) == (1, 1)


def test_aggregates_visits_of_same_slug():
    out = contrib(
        visit(1, [GENERIC, OUTIL]),
        visit(2, [CC]),
        visit(3, [OUTIL, GENERIC]),
    )
    r = row(out, SLUG)
    assert (
        r["nb_visites_total"],
        r["nb_visites_contribution"],
        r["nb_visites_suite"],
    ) == (3, 2, 1)


# --- dimensions ---------------------------------------------------------------


def test_split_by_device():
    out = contrib(
        visit(1, [GENERIC, OUTIL], os="Windows"),
        visit(2, [GENERIC], os="iOS"),
    )
    assert row(out, SLUG, "desktop")["nb_visites_suite"] == 1
    mobile = row(out, SLUG, "mobile")
    assert (mobile["nb_visites_contribution"], mobile["nb_visites_suite"]) == (1, 0)


def test_split_by_referrer_type_lowercased_and_unknown():
    out = contrib(
        visit(1, [GENERIC], referrer="Search"),
        visit(2, [GENERIC], referrer=None),
        visit(3, [GENERIC], referrer=""),
    )
    assert row(out, SLUG, referrer="search")["nb_visites_total"] == 1
    assert row(out, SLUG, referrer="inconnu")["nb_visites_total"] == 2


# --- fiches SP ----------------------------------------------------------------


def test_fiche_continuation():
    out = classify_fiches(frame(visit(1, [FICHE, GENERIC]), visit(2, [FICHE])))
    r = row(out, "conges-payes")
    assert (r["nb_visites_total"], r["nb_visites_fiche_sp"]) == (2, 2)
    assert r["nb_visites_suite"] == 1


def test_fiche_reload_is_not_continuation():
    out = classify_fiches(frame(visit(1, [FICHE, f"{FICHE}?x=1"])))
    assert row(out, "conges-payes")["nb_visites_suite"] == 0


def test_fiche_return_after_other_page_is_continuation():
    out = classify_fiches(frame(visit(1, [FICHE, OUTIL, FICHE])))
    assert row(out, "conges-payes")["nb_visites_suite"] == 1


def test_fiche_not_first_page_counts_in_total_only():
    out = classify_fiches(frame(visit(1, [OUTIL, FICHE])))
    r = row(out, "conges-payes")
    assert (r["nb_visites_total"], r["nb_visites_fiche_sp"]) == (1, 0)


def test_fiche_other_fiche_is_continuation():
    other = f"{BASE}/fiche-service-public/autre"
    out = classify_fiches(frame(visit(1, [FICHE, other])))
    assert row(out, "conges-payes")["nb_visites_suite"] == 1
