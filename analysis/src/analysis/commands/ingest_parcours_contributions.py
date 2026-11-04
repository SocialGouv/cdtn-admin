"""CLI : calcule la poursuite de navigation après une contribution et l'insère en BDD.

Usage::

    ingest-parcours-contributions 2026-06-01
    ingest-parcours-contributions 2025-11-04 --end 2026-11-03   # backfill

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.parcours_contributions import get_parcours_contributions

_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS parcours_contributions (
    date             DATE    NOT NULL,
    device           TEXT    NOT NULL,
    referrer_type    TEXT    NOT NULL,
    slug             TEXT    NOT NULL,
    nb_visites_total INTEGER NOT NULL,
    nb_visites_contribution INTEGER NOT NULL,
    nb_visites_suite INTEGER NOT NULL,
    PRIMARY KEY (date, device, referrer_type, slug)
);
"""

_UPSERT = """
INSERT INTO parcours_contributions
    (date, device, referrer_type, slug, nb_visites_total, nb_visites_contribution,
     nb_visites_suite)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device, referrer_type, slug)
DO UPDATE SET
    nb_visites_total = EXCLUDED.nb_visites_total,
    nb_visites_contribution = EXCLUDED.nb_visites_contribution,
    nb_visites_suite = EXCLUDED.nb_visites_suite;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame du parcours en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``. Les taux ne sont pas
    stockés : part d'entrée = ``nb_visites_contribution / nb_visites_total``,
    poursuite = ``nb_visites_suite / nb_visites_contribution``.
    """
    return [
        (
            date,
            row["device"],
            row["referrer_type"],
            row["slug"],
            int(row["nb_visites_total"]),
            int(row["nb_visites_contribution"]),
            int(row["nb_visites_suite"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Calcule et upsert le parcours après une contribution d'une journée."""
    df = get_parcours_contributions(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="parcours-contributions", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Calcule la poursuite de navigation des visites démarrant sur une "
            "contribution depuis le réplica SQL Matomo et l'insère dans la base "
            "PostgreSQL de Metabase."
        )
    )
    parser.add_argument(
        "date",
        help='Date de début au format ISO YYYY-MM-DD (ex: "2026-06-01").',
    )
    parser.add_argument(
        "--end",
        dest="end_date",
        default=None,
        help=(
            "Date de fin (inclusive) au format ISO YYYY-MM-DD. Si absente, traite "
            "uniquement la date de début."
        ),
    )
    args = parser.parse_args()

    start = parse_date(args.date, "date", parser)
    end = parse_date(args.end_date, "--end", parser) if args.end_date else start

    if end < start:
        parser.error(
            f"La date de fin ({end}) est antérieure à la date de début ({start})."
        )

    days = list(iter_days(start, end))
    total = run_ingest(days, [INGESTER])
    print(f"\nTerminé : {total} lignes sur {len(days)} jour(s).")


if __name__ == "__main__":
    sys.exit(main())
