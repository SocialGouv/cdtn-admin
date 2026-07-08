"""CLI : récupère les taux de complétion des simulateurs et les insère en BDD.

Usage::

    ingest-simulateurs 2026-06-01
    ingest-simulateurs 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.completion_simulateurs import get_completion_simulateurs

# Schéma de la table cible et requête d'upsert propres à ce report. Chaque
# commande d'ingestion gère la structure et l'insert de ses propres données ; le
# connecteur Metabase, lui, reste générique.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS completion_simulateurs (
    date        DATE        NOT NULL,
    device      TEXT        NOT NULL,
    titre       TEXT        NOT NULL,
    visites     NUMERIC,
    start_count INTEGER,
    result_count INTEGER,
    PRIMARY KEY (date, device, titre)
);
"""

_UPSERT = """
INSERT INTO completion_simulateurs
    (date, device, titre, visites, start_count, result_count)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device, titre)
DO UPDATE SET
    visites      = EXCLUDED.visites,
    start_count  = EXCLUDED.start_count,
    result_count = EXCLUDED.result_count;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame de complétion en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``. Le taux de complétion
    n'est pas stocké : il se déduit de ``result_count / start_count``.
    """
    return [
        (
            date,
            row["device"],
            row["titre"],
            row["visites"] if pd.notna(row["visites"]) else None,
            int(row["Start"]),
            int(row["Result"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Agrège et upsert la complétion des simulateurs pour une journée."""
    df = get_completion_simulateurs(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="simulateurs", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Récupère les taux de complétion des simulateurs via l'API Matomo "
            "et les insère dans la base PostgreSQL de Metabase."
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
