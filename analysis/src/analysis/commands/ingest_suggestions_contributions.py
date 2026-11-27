"""CLI: stores the clarity widget suggestion verbatims in the DB.

Usage::

    ingest-suggestions-contributions 2026-06-01
    ingest-suggestions-contributions 2026-06-01 --end 2026-06-30

Also exposes ``INGESTER`` so it runs in ``ingest-all``.

**Personal data**: the table holds free text typed by users, which may contain
personal data despite the on-page warning. Restrict its Metabase access to the
team. Retention: purge rows older than 12 months (not automated).
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.suggestions_contributions import get_suggestions_contributions

# Target table schema and insert for this report: one row per suggestion.
#
# Re-running a day must not duplicate rows: a suggestion is identified by
# (horodatage, page, suggestion) and an already stored one is left untouched.
# Two identical texts sent on the same page at the same timestamp are therefore
# stored once.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS suggestions_contributions (
    horodatage  TIMESTAMP NOT NULL,
    date        DATE      NOT NULL,
    page        TEXT      NOT NULL,
    device      TEXT      NOT NULL,
    suggestion  TEXT      NOT NULL,
    PRIMARY KEY (horodatage, page, suggestion)
);
"""

_INSERT = """
INSERT INTO suggestions_contributions
    (horodatage, date, page, device, suggestion)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (horodatage, page, suggestion)
DO NOTHING;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convert the report DataFrame into rows for ``_INSERT``.

    Values follow the column order of ``_INSERT``.
    """
    return [
        (
            row["horodatage"].to_pydatetime(),
            date,
            row["page"],
            row["device"],
            row["suggestion"],
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Insert the clarity widget suggestions of one day."""
    df = get_suggestions_contributions(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_INSERT, rows=rows)


# Registered in ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="suggestions-contributions", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Stores each suggestion sent from the contribution clarity widget "
            "(free text, may contain personal data) from the Matomo SQL replica "
            "in the Metabase PostgreSQL database."
        )
    )
    parser.add_argument(
        "date",
        help='Start date, ISO format YYYY-MM-DD (e.g. "2026-06-01").',
    )
    parser.add_argument(
        "--end",
        dest="end_date",
        default=None,
        help=(
            "End date (inclusive), ISO format YYYY-MM-DD. When omitted, only the "
            "start date is processed."
        ),
    )
    args = parser.parse_args()

    start = parse_date(args.date, "date", parser)
    end = parse_date(args.end_date, "--end", parser) if args.end_date else start

    if end < start:
        parser.error(f"End date ({end}) is before start date ({start}).")

    days = list(iter_days(start, end))
    total = run_ingest(days, [INGESTER])
    print(f"\nDone: {total} rows over {len(days)} day(s).")


if __name__ == "__main__":
    sys.exit(main())
