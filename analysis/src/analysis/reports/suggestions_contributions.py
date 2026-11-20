"""Contribution clarity widget: suggestion verbatims (Matomo SQL replica).

Each suggestion sent from the clarity widget at the bottom of contribution pages
is a Matomo event of category ``clarte_contribution_suggestion`` whose action is
the free text the user typed (1 to 500 characters) and whose name is
``contribution/<slug>``. This report returns one row per suggestion:

* ``horodatage`` — event timestamp, UTC;
* ``page`` — contribution slug (see ``notation_contributions_pages``);
* ``device`` — desktop / mobile, read from the user agent the CDTN forwards;
* ``suggestion`` — the text, as typed.

**Personal data**: this is free text typed by users. Despite the on-page warning
it may contain personal data (names, situations, contact details), so Metabase
access to the table must be restricted to the team. Retention: purge rows older
than 12 months (not automated).

The suggestion count per day and device stays in
``notation_contributions.nb_suggestions``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import device_from_os
from analysis.reports.notation_contributions import SUGGESTION_CATEGORY
from analysis.reports.notation_contributions_pages import event_pages

_COLUMNS = ["horodatage", "page", "device", "suggestion"]

_EVENT_COLUMNS = [
    "action_timestamp",
    "operatingsystemname",
    "action_type",
    "action_url",
    "action_eventcategory",
    "action_eventaction",
    "action_eventname",
]

_QUERY = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND action_type = 'event'
  AND action_eventcategory = %s;
"""


def get_suggestions_contributions(
    date: str, matomo: object | None = None
) -> pd.DataFrame:
    """Return the clarity widget suggestions sent on a given day.

    Args:
        date: ISO date YYYY-MM-DD (e.g. "2026-06-01").
        matomo: Unused (data comes from the Matomo SQL replica, opened by the
            report). Kept for consistency with the other reports.

    Returns:
        DataFrame with columns: horodatage, page, device, suggestion. One row
        per suggestion.
    """
    with MatomoSQLConnectorSync() as client:
        events = client.run_query_df(_QUERY, (date, date, SUGGESTION_CATEGORY))
    return extract_suggestions(events)


def extract_suggestions(events: pd.DataFrame) -> pd.DataFrame:
    """Return one row per suggestion event.

    Pure function (no I/O), split from the query so it can be tested. Any text
    is a verbatim, even one that looks like a rating action (e.g. ``note_2``).
    Events without text or whose contribution cannot be identified are dropped.

    Args:
        events: Matomo events, with at least the columns ``action_timestamp``,
            ``operatingsystemname``, ``action_type``, ``action_url``,
            ``action_eventcategory``, ``action_eventaction`` and
            ``action_eventname``.
    """
    if events.empty:
        return pd.DataFrame(columns=_COLUMNS)

    suggestions = events[
        (events["action_type"] == "event")
        & (events["action_eventcategory"] == SUGGESTION_CATEGORY)
    ]
    out = pd.DataFrame(
        {
            # Normalized to naive UTC (``TIMESTAMP`` column), whether the replica
            # returns naive (UTC) or timezone-aware timestamps.
            "horodatage": pd.to_datetime(
                suggestions["action_timestamp"], utc=True
            ).dt.tz_localize(None),
            "page": event_pages(suggestions),
            "device": suggestions["operatingsystemname"].map(device_from_os),
            "suggestion": suggestions["action_eventaction"],
        }
    )
    has_text = out["suggestion"].fillna("").str.len() > 0
    return out[has_text].dropna(subset=["horodatage", "page"]).reset_index(drop=True)
