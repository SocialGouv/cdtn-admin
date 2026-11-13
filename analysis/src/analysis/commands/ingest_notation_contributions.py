"""CLI: stores the contribution rating counts (response rate + score) in the DB.

Usage::

    ingest-notation-contributions 2026-06-01
    ingest-notation-contributions 2026-06-01 --end 2026-06-30

Also exposes ``INGESTER`` so it runs in ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.notation_contributions import get_notation_contributions

# Target table schema and upsert for this report.
#
# Rates and averages are NOT stored (derived values, computed in Metabase):
# response rate = (nb_notes_1 + … + nb_notes_5) / nb_visites_contributions;
# average score = (1 * nb_notes_1 + … + 5 * nb_notes_5) / (nb_notes_1 + … +
# nb_notes_5).
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS notation_contributions (
    date                      DATE    NOT NULL,
    device                    TEXT    NOT NULL,
    nb_visites_contributions  INTEGER NOT NULL,
    nb_notes_1                INTEGER NOT NULL,
    nb_notes_2                INTEGER NOT NULL,
    nb_notes_3                INTEGER NOT NULL,
    nb_notes_4                INTEGER NOT NULL,
    nb_notes_5                INTEGER NOT NULL,
    PRIMARY KEY (date, device)
);
"""

_UPSERT = """
INSERT INTO notation_contributions
    (date, device, nb_visites_contributions,
     nb_notes_1, nb_notes_2, nb_notes_3, nb_notes_4, nb_notes_5)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device)
DO UPDATE SET
    nb_visites_contributions = EXCLUDED.nb_visites_contributions,
    nb_notes_1               = EXCLUDED.nb_notes_1,
    nb_notes_2               = EXCLUDED.nb_notes_2,
    nb_notes_3               = EXCLUDED.nb_notes_3,
    nb_notes_4               = EXCLUDED.nb_notes_4,
    nb_notes_5               = EXCLUDED.nb_notes_5;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convert the report DataFrame into rows for ``_UPSERT``.

    Values follow the column order of ``_UPSERT``.
    """
    return [
        (
            date,
            row["device"],
            int(row["nb_visites_contributions"]),
            int(row["nb_notes_1"]),
            int(row["nb_notes_2"]),
            int(row["nb_notes_3"]),
            int(row["nb_notes_4"]),
            int(row["nb_notes_5"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Aggregate and upsert the contribution ratings for one day."""
    df = get_notation_contributions(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Registered in ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="notation-contributions", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Counts contribution visits and rating widget scores (1 to 5 stars) "
            "from the Matomo SQL replica and stores them in the Metabase "
            "PostgreSQL database."
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
