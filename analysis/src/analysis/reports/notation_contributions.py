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

Free-text suggestions (category ``clarte_contribution_suggestion``) are not
ingested. The historical 5-point events (category ``notation_contribution``) are
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
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import DEVICE_SEGMENTS, device_from_os

DEVICES: list[str] = list(DEVICE_SEGMENTS)

# Events emitted by the CDTN clarity widget (``RatingMatomo`` in the frontend).
# The historical 5-point category ``notation_contribution`` is deliberately left
# out, as is ``clarte_contribution_suggestion`` (free text).
_RATING_CATEGORY = "clarte_contribution"
SCORES: list[int] = [1, 2, 3]
REASONS: list[str] = [
    "texte_difficile",
    "applicable_situation",
    "comment_appliquer",
    "informations_fausses",
]

# Event action -> counter column. Any other action is ignored.
_ACTION_COLUMNS: dict[str, str] = {
    **{f"note_{score}": f"nb_notes_{score}" for score in SCORES},
    **{f"raison_{reason}": f"nb_raisons_{reason}" for reason in REASONS},
    "remarque": "nb_remarques",
}
_EVENT_COUNT_COLUMNS = list(_ACTION_COLUMNS.values())
_COLUMNS = ["device", "nb_visites_contributions", *_EVENT_COUNT_COLUMNS]

# Contribution page: ``/contribution/{slug}`` (optionally followed by a
# collective agreement segment, a query string or an anchor). The bare
# ``/contribution`` index does not match.
_CONTRIBUTION_PAGE_RE = r"/contribution/[^/?#]+"

_EVENT_COLUMNS = [
    "idvisit",
    "operatingsystemname",
    "action_type",
    "action_url",
    "action_eventcategory",
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
    """Return contribution visits, ratings, reasons and remarks for a given day.

    Args:
        date: ISO date YYYY-MM-DD (e.g. "2026-06-01").
        matomo: Unused (data comes from the Matomo SQL replica, opened by the
            report). Kept for consistency with the other reports.

    Returns:
        DataFrame with columns: device, nb_visites_contributions, nb_notes_1 …
        nb_notes_3, nb_raisons_texte_difficile, nb_raisons_applicable_situation,
        nb_raisons_comment_appliquer, nb_raisons_informations_fausses,
        nb_remarques. One row per device, set to 0 when there is no data that
        day.
    """
    with MatomoSQLConnectorSync() as client:
        events = client.run_query_df(
            _QUERY, (date, date, "%/contribution/%", _RATING_CATEGORY)
        )
    return aggregate_events(events)


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

    # Ratings, reasons and remarks: counted as events (one per click), device
    # read from the user agent the CDTN forwards with each event.
    widget = events[
        (events["action_type"] == "event")
        & (events["action_eventcategory"] == _RATING_CATEGORY)
    ]
    by_column = (
        pd.DataFrame(
            {
                "device": widget["operatingsystemname"].map(device_from_os),
                "column": widget["action_eventaction"].map(_ACTION_COLUMNS),
            }
        )
        .dropna(subset=["column"])
        .groupby(["device", "column"])
        .size()
        .unstack("column", fill_value=0)
        .reindex(index=counts.index, columns=_EVENT_COUNT_COLUMNS, fill_value=0)
    )
    counts[_EVENT_COUNT_COLUMNS] = by_column.to_numpy()

    return counts.reset_index()
