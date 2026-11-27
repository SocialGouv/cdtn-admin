"""CLI: stores the per-contribution clarity rating counts in the DB.

Usage::

    ingest-notation-contributions-pages 2026-06-01
    ingest-notation-contributions-pages 2026-06-01 --end 2026-06-30

Also exposes ``INGESTER`` so it runs in ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.notation_contributions_pages import (
    COUNT_COLUMNS,
    get_notation_contributions_pages,
)

# Target table schema and upsert for this report: per-contribution detail of
# ``notation_contributions`` (no device dimension).
#
# Summing ``nb_visites`` across pages overcounts visits that viewed several
# contributions: the global response rate uses
# ``notation_contributions.nb_visites_contributions``. Rates and averages are NOT
# stored (derived values, computed in Metabase).
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS notation_contributions_pages (
    date                             DATE    NOT NULL,
    page                             TEXT    NOT NULL,
    nb_visites                       INTEGER NOT NULL,
    nb_notes_1                       INTEGER NOT NULL,
    nb_notes_2                       INTEGER NOT NULL,
    nb_notes_3                       INTEGER NOT NULL,
    nb_raisons_texte_difficile       INTEGER NOT NULL,
    nb_raisons_applicable_situation  INTEGER NOT NULL,
    nb_raisons_comment_appliquer     INTEGER NOT NULL,
    nb_raisons_informations_fausses  INTEGER NOT NULL,
    nb_remarques                     INTEGER NOT NULL,
    nb_suggestions                   INTEGER NOT NULL,
    PRIMARY KEY (date, page)
);
"""

_UPSERT = """
INSERT INTO notation_contributions_pages
    (date, page, nb_visites,
     nb_notes_1, nb_notes_2, nb_notes_3,
     nb_raisons_texte_difficile, nb_raisons_applicable_situation,
     nb_raisons_comment_appliquer, nb_raisons_informations_fausses,
     nb_remarques, nb_suggestions)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, page)
DO UPDATE SET
    nb_visites                      = EXCLUDED.nb_visites,
    nb_notes_1                      = EXCLUDED.nb_notes_1,
    nb_notes_2                      = EXCLUDED.nb_notes_2,
    nb_notes_3                      = EXCLUDED.nb_notes_3,
    nb_raisons_texte_difficile      = EXCLUDED.nb_raisons_texte_difficile,
    nb_raisons_applicable_situation = EXCLUDED.nb_raisons_applicable_situation,
    nb_raisons_comment_appliquer    = EXCLUDED.nb_raisons_comment_appliquer,
    nb_raisons_informations_fausses = EXCLUDED.nb_raisons_informations_fausses,
    nb_remarques                    = EXCLUDED.nb_remarques,
    nb_suggestions                  = EXCLUDED.nb_suggestions;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convert the report DataFrame into rows for ``_UPSERT``.

    Values follow the column order of ``_UPSERT``.
    """
    return [
        (date, row["page"], *(int(row[column]) for column in COUNT_COLUMNS))
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Aggregate and upsert the per-contribution clarity ratings for one day."""
    df = get_notation_contributions_pages(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Registered in ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="notation-contributions-pages", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Counts visits and clarity widget events (scores 1 to 3, reasons, "
            "remarks, suggestions) per contribution page from the Matomo SQL "
            "replica and stores them in the Metabase PostgreSQL database."
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
