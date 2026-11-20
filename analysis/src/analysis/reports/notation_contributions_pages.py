"""Contribution clarity rating, per contribution (Matomo SQL replica).

Per-contribution detail of ``notation_contributions`` (same events, same
counters, see that report), one row per (day, page) where ``page`` is the
contribution slug:

* for the clarity widget events, the ``<slug>`` of the event name
  ``contribution/<slug>`` (falling back to the event URL
  ``https://code.travail.gouv.fr/contribution/<slug>``);
* for the page views, the ``<slug>`` of the ``/contribution/<slug>`` URL path,
  query string and anchor stripped. The collective agreement page
  ``/contribution/<slug>/<idcc>-<name>`` maps to ``<idcc>-<slug>``, the slug
  its widget sends; ``/contribution/<idcc>-<slug>`` is kept as is. The
  ``/contribution`` index is excluded.

Columns: ``nb_visites`` (**visits** that viewed that contribution page) and the
event counters ``nb_notes_1`` … ``nb_notes_3``, ``nb_raisons_*``,
``nb_remarques``, ``nb_suggestions``. No device dimension (the device split
stays in ``notation_contributions``). Pages whose counters are all 0 are not
returned.

A visit that viewed several contributions counts once in each of them: summing
``nb_visites`` across pages overcounts visits. The global response rate must
therefore use ``notation_contributions.nb_visites_contributions``; the per-page
rate is ``(nb_notes_1 + nb_notes_2 + nb_notes_3) / nb_visites`` of that page.
Derived values are not stored (computed in Metabase).
"""

from __future__ import annotations

import re

import pandas as pd

from analysis.reports.notation_contributions import (
    EVENT_COUNT_COLUMNS,
    contribution_page_views,
    query_events,
    widget_events,
)

COUNT_COLUMNS = ["nb_visites", *EVENT_COUNT_COLUMNS]
_COLUMNS = ["page", *COUNT_COLUMNS]

# ``/contribution/<slug>`` with an optional ``/<idcc>[-<name>]`` collective
# agreement segment, before a query string or an anchor.
_PAGE_URL_RE = re.compile(r"/contribution/([^/?#]+)(?:/(\d+)(?=[-/?#]|$))?")
# ``contribution/<slug>`` event name. A ``|`` suffix (experiment variant) ends
# the slug, as in ``taux_contributions``.
_PAGE_EVENT_NAME_RE = r"^/?contribution/([^/?#|]+)"


def page_from_url(url: str | None) -> str | None:
    """Contribution slug of a page URL, ``None`` if it is not a contribution."""
    match = _PAGE_URL_RE.search(url or "")
    if not match:
        return None
    slug, idcc = match.groups()
    return f"{idcc}-{slug}" if idcc else slug


def event_pages(events: pd.DataFrame) -> pd.Series:
    """Contribution slug of each widget event (event name, else event URL)."""
    from_name = events["action_eventname"].str.extract(_PAGE_EVENT_NAME_RE)[0]
    return from_name.fillna(events["action_url"].map(page_from_url))


def get_notation_contributions_pages(
    date: str, matomo: object | None = None
) -> pd.DataFrame:
    """Return contribution visits and clarity widget counters per page for a day.

    Args:
        date: ISO date YYYY-MM-DD (e.g. "2026-06-01").
        matomo: Unused (data comes from the Matomo SQL replica, opened by the
            report). Kept for consistency with the other reports.

    Returns:
        DataFrame with columns: page, nb_visites, nb_notes_1 … nb_notes_3,
        nb_raisons_texte_difficile, nb_raisons_applicable_situation,
        nb_raisons_comment_appliquer, nb_raisons_informations_fausses,
        nb_remarques, nb_suggestions. One row per page with at least one
        non-zero counter.
    """
    return aggregate_pages(query_events(date))


def aggregate_pages(events: pd.DataFrame) -> pd.DataFrame:
    """Aggregate page views and clarity widget events per contribution page.

    Pure function (no I/O), split from the query so it can be tested.

    Args:
        events: page views and widget events, with at least the columns
            ``idvisit``, ``action_type``, ``action_url``,
            ``action_eventcategory``, ``action_eventaction`` and
            ``action_eventname``.
    """
    if events.empty:
        return pd.DataFrame(columns=_COLUMNS)

    # Visits: a visit counts once per contribution page it viewed.
    views = contribution_page_views(events)
    visits = (
        pd.DataFrame(
            {
                "idvisit": views["idvisit"],
                "page": views["action_url"].map(page_from_url),
            }
        )
        .dropna(subset=["page"])
        .drop_duplicates()
        .groupby("page")
        .size()
        .rename("nb_visites")
    )

    # Ratings, reasons, remarks and suggestions: counted as events.
    widget = widget_events(events)
    by_column = (
        pd.DataFrame({"page": event_pages(widget), "column": widget["column"]})
        .dropna(subset=["page"])
        .groupby(["page", "column"])
        .size()
        .unstack("column", fill_value=0)
    )

    index = pd.Index(sorted(set(visits.index) | set(by_column.index)), name="page")
    counts = by_column.reindex(index=index, columns=EVENT_COUNT_COLUMNS, fill_value=0)
    counts.insert(0, "nb_visites", visits.reindex(index, fill_value=0))
    counts = counts.astype(int)
    counts.columns.name = None
    return counts[counts.sum(axis=1) > 0].reset_index()[_COLUMNS]
