"""Contribution clarity rating: response rate, score and reasons (Matomo SQL replica).

The rating widget at the bottom of contribution pages (3 stars, CDTN #7587:
1 = "Pas clair", 2 = "En partie", 3 = "Très clair") emits Matomo events in the
category ``clarte_contribution`` (event name ``contribution/<slug>``):

* ``note_1`` | ``note_2`` | ``note_3`` — one per star click;
* ``raison_texte_difficile``, ``raison_applicable_situation``,
  ``raison_comment_appliquer``, ``raison_informations_fausses`` — one per reason
  checked after a score of 1 or 2;
* ``remarque`` — click on "Une remarque ?".

For each device (desktop / mobile) and day, this report counts:

* ``nb_visites_contributions`` — **visits** that viewed at least one contribution
  page (``/contribution/{slug}``, generic or collective agreement page). The
  ``/contribution`` index page is excluded.
* ``nb_notes_1`` … ``nb_notes_3`` — number of **rating events** for each score.
* ``nb_raisons_texte_difficile``, ``nb_raisons_applicable_situation``,
  ``nb_raisons_comment_appliquer``, ``nb_raisons_informations_fausses`` — number
  of **reason events** for each reason.
* ``nb_remarques`` — number of **"Une remarque ?" click events**.
* ``nb_suggestions`` — number of **suggestions sent** (category
  ``clarte_contribution_suggestion``, from either panel). Only counted here:
  the free text itself (the event action) is stored separately, in
  ``suggestions_contributions`` (restricted access).

The historical 5-point events (category ``notation_contribution``) are
intentionally not ingested either, so the two scales never mix.

The events are relayed server side by the CDTN without any visitor id: in Matomo
each event lands in its own visit, which cannot be linked to the visit that
viewed the page. Ratings, reasons and remarks are therefore counted as events,
independently of the page views.

Derived values are not stored (computed in Metabase):
number of ratings = ``nb_notes_1 + nb_notes_2 + nb_notes_3``;
response rate = number of ratings / ``nb_visites_contributions``;
average score (1 to 3) = ``(1 * nb_notes_1 + 2 * nb_notes_2 + 3 * nb_notes_3)`` /
number of ratings.

The per-contribution detail of the same counters lives in
``notation_contributions_pages``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import DEVICE_SEGMENTS, device_from_os

DEVICES: list[str] = list(DEVICE_SEGMENTS)

# Events emitted by the CDTN clarity widget (``RatingMatomoCategory`` in the
# frontend). The historical 5-point category ``notation_contribution`` is
# deliberately left out. Suggestions carry the free text in their action: in
# this table they are only counted (the text goes to
# ``suggestions_contributions``, see that report).
RATING_CATEGORY = "clarte_contribution"
SUGGESTION_CATEGORY = "clarte_contribution_suggestion"
SUGGESTION_COLUMN = "nb_suggestions"
SCORES: list[int] = [1, 2, 3]
REASONS: list[str] = [
    "texte_difficile",
    "applicable_situation",
    "comment_appliquer",
    "informations_fausses",
]

# Event action -> counter column. Any other action is ignored.
ACTION_COLUMNS: dict[str, str] = {
    **{f"note_{score}": f"nb_notes_{score}" for score in SCORES},
    **{f"raison_{reason}": f"nb_raisons_{reason}" for reason in REASONS},
    "remarque": "nb_remarques",
}
EVENT_COUNT_COLUMNS = [*ACTION_COLUMNS.values(), SUGGESTION_COLUMN]
_COLUMNS = ["device", "nb_visites_contributions", *EVENT_COUNT_COLUMNS]

# Contribution page: ``/contribution/{slug}`` (optionally followed by a
# collective agreement segment, a query string or an anchor). The bare
# ``/contribution`` index does not match.
CONTRIBUTION_PAGE_RE = r"/contribution/[^/?#]+"

_EVENT_COLUMNS = [
    "idvisit",
    "operatingsystemname",
    "action_type",
    "action_url",
    "action_eventcategory",
    "action_eventaction",
    "action_eventname",
]

# Contribution page views and clarity widget events of the day. Shared with the
# per-contribution report (``notation_contributions_pages``).
_QUERY = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND (
        (action_type = 'action' AND action_url LIKE %s)
     OR (action_type = 'event' AND action_eventcategory IN (%s, %s))
  );
"""


def query_events(date: str) -> pd.DataFrame:
    """Fetch the contribution page views and clarity widget events of a day.

    Args:
        date: ISO date YYYY-MM-DD (e.g. "2026-06-01").

    Returns:
        DataFrame with the columns of ``_EVENT_COLUMNS`` (Matomo SQL replica).
    """
    with MatomoSQLConnectorSync() as client:
        return client.run_query_df(
            _QUERY,
            (date, date, "%/contribution/%", RATING_CATEGORY, SUGGESTION_CATEGORY),
        )


def get_notation_contributions(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Return contribution visits, ratings, reasons and remarks for a given day.

    Args:
        date: ISO date YYYY-MM-DD (e.g. "2026-06-01").
        matomo: Unused (data comes from the Matomo SQL replica, opened by the
            report). Kept for consistency with the other reports.

    Returns:
        DataFrame with columns: device, nb_visites_contributions, nb_notes_1 …
        nb_notes_3, nb_raisons_texte_difficile, nb_raisons_applicable_situation,
        nb_raisons_comment_appliquer, nb_raisons_informations_fausses,
        nb_remarques, nb_suggestions. One row per device, set to 0 when there
        is no data that day.
    """
    return aggregate_events(query_events(date))


def contribution_page_views(events: pd.DataFrame) -> pd.DataFrame:
    """Return the contribution page views (``/contribution`` index excluded)."""
    return events[
        (events["action_type"] == "action")
        & events["action_url"].str.contains(CONTRIBUTION_PAGE_RE, na=False)
    ]


def widget_events(events: pd.DataFrame) -> pd.DataFrame:
    """Return the clarity widget events, with the counter ``column`` they feed.

    A suggestion maps to ``nb_suggestions`` whatever its (free text) action;
    a rating event whose action is unknown is dropped.
    """
    widget = events[
        (events["action_type"] == "event")
        & events["action_eventcategory"].isin([RATING_CATEGORY, SUGGESTION_CATEGORY])
    ]
    is_suggestion = widget["action_eventcategory"] == SUGGESTION_CATEGORY
    column = (
        widget["action_eventaction"]
        .map(ACTION_COLUMNS)
        .where(~is_suggestion, SUGGESTION_COLUMN)
    )
    return widget.assign(column=column).dropna(subset=["column"])


def aggregate_events(events: pd.DataFrame) -> pd.DataFrame:
    """Aggregate page views and clarity widget events per device.

    Pure function (no I/O), split from the query so it can be tested.

    Args:
        events: page views and rating events, with at least the columns
            ``idvisit``, ``operatingsystemname``, ``action_type``,
            ``action_url``, ``action_eventcategory`` and ``action_eventaction``.
    """
    counts = pd.DataFrame(
        [{"device": device, **dict.fromkeys(_COLUMNS[1:], 0)} for device in DEVICES],
        columns=_COLUMNS,
    ).set_index("device")

    if events.empty:
        return counts.reset_index()

    # Visits: a visit is "mobile" if at least one of its rows is.
    pages = contribution_page_views(events)
    is_mobile = (
        pages["operatingsystemname"]
        .map(device_from_os)
        .eq("mobile")
        .groupby(pages["idvisit"])
        .any()
    )
    visits = is_mobile.map({True: "mobile", False: "desktop"}).value_counts()
    counts["nb_visites_contributions"] = visits.reindex(counts.index, fill_value=0)

    # Ratings, reasons, remarks and suggestions: counted as events (one per
    # click or send), device read from the user agent the CDTN forwards with
    # each event.
    widget = widget_events(events)
    by_column = (
        pd.DataFrame(
            {
                "device": widget["operatingsystemname"].map(device_from_os),
                "column": widget["column"],
            }
        )
        .groupby(["device", "column"])
        .size()
        .unstack("column", fill_value=0)
        .reindex(index=counts.index, columns=EVENT_COUNT_COLUMNS, fill_value=0)
    )
    counts[EVENT_COUNT_COLUMNS] = by_column.to_numpy()

    return counts.reset_index()
