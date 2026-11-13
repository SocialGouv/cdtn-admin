"""Contribution clarity rating: response rate and score (Matomo SQL replica).

The rating widget at the bottom of contribution pages (5 stars, CDTN #7587) emits
the Matomo event ``notation_contribution`` / ``note_<1..5>`` when the user clicks
"Valider". For each device (desktop / mobile) and day, this report counts:

* ``nb_visites_contributions`` — **visits** that viewed at least one contribution
  page (``/contribution/{slug}``, generic or collective agreement page). The
  ``/contribution`` index page is excluded.
* ``nb_notes_1`` … ``nb_notes_5`` — number of **rating events** for each score.

The rating is relayed server side by the CDTN without any visitor id: in Matomo
each rating lands in its own visit, which cannot be linked to the visit that
viewed the page. Ratings are therefore counted as events, independently of the
page views.

Derived values are not stored (computed in Metabase):
number of ratings = ``nb_notes_1 + … + nb_notes_5``;
response rate = number of ratings / ``nb_visites_contributions``;
average score = ``(1 * nb_notes_1 + … + 5 * nb_notes_5)`` / number of ratings.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import DEVICE_SEGMENTS, device_from_os

DEVICES: list[str] = list(DEVICE_SEGMENTS)

# Event emitted by the CDTN rating widget (``RatingMatomo`` in the frontend).
_RATING_CATEGORY = "notation_contribution"
_RATING_ACTION_RE = r"^note_([1-5])$"
SCORES: list[int] = [1, 2, 3, 4, 5]

_NOTE_COLUMNS = [f"nb_notes_{score}" for score in SCORES]
_COLUMNS = ["device", "nb_visites_contributions", *_NOTE_COLUMNS]

# Contribution page: ``/contribution/{slug}`` (optionally followed by a
# collective agreement segment, a query string or an anchor). The bare
# ``/contribution`` index does not match.
_CONTRIBUTION_PAGE_RE = r"/contribution/[^/?#]+"

_EVENT_COLUMNS = [
    "idvisit",
    "operatingsystemname",
    "action_type",
    "action_url",
    "action_eventaction",
]

_QUERY = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND (
        (action_type = 'action' AND action_url LIKE %s)
     OR (action_type = 'event' AND action_eventcategory = %s)
  );
"""


def get_notation_contributions(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Return contribution visits and ratings per score for a given day.

    Args:
        date: ISO date YYYY-MM-DD (e.g. "2026-06-01").
        matomo: Unused (data comes from the Matomo SQL replica, opened by the
            report). Kept for consistency with the other reports.

    Returns:
        DataFrame with columns: device, nb_visites_contributions, nb_notes_1 …
        nb_notes_5. One row per device, set to 0 when there is no data that day.
    """
    with MatomoSQLConnectorSync() as client:
        events = client.run_query_df(
            _QUERY, (date, date, "%/contribution/%", _RATING_CATEGORY)
        )
    return aggregate_events(events)


def aggregate_events(events: pd.DataFrame) -> pd.DataFrame:
    """Aggregate page views and rating events per device.

    Pure function (no I/O), split from the query so it can be tested.

    Args:
        events: page views and rating events, with at least the columns
            ``idvisit``, ``operatingsystemname``, ``action_type``,
            ``action_url`` and ``action_eventaction``.
    """
    counts = pd.DataFrame(
        [{"device": device, **dict.fromkeys(_COLUMNS[1:], 0)} for device in DEVICES],
        columns=_COLUMNS,
    ).set_index("device")

    if events.empty:
        return counts.reset_index()

    # Visits: a visit is "mobile" if at least one of its rows is.
    pages = events[
        (events["action_type"] == "action")
        & events["action_url"].str.contains(_CONTRIBUTION_PAGE_RE, na=False)
    ]
    is_mobile = (
        pages["operatingsystemname"]
        .map(device_from_os)
        .eq("mobile")
        .groupby(pages["idvisit"])
        .any()
    )
    visits = is_mobile.map({True: "mobile", False: "desktop"}).value_counts()
    counts["nb_visites_contributions"] = visits.reindex(counts.index, fill_value=0)

    # Ratings: counted as events (one per "Valider" click), device read from
    # the user agent the CDTN forwards with each rating.
    ratings = events[events["action_type"] == "event"]
    score = ratings["action_eventaction"].str.extract(_RATING_ACTION_RE)[0]
    ratings = pd.DataFrame(
        {
            "device": ratings["operatingsystemname"].map(device_from_os),
            "score": score,
        }
    ).dropna(subset=["score"])
    by_score = (
        ratings.astype({"score": int})
        .groupby(["device", "score"])
        .size()
        .unstack("score", fill_value=0)
        .reindex(index=counts.index, columns=SCORES, fill_value=0)
    )
    counts[_NOTE_COLUMNS] = by_score.to_numpy()

    return counts.reset_index()
