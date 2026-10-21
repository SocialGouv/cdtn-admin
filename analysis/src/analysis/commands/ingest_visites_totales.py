"""CLI : calcule la poursuite de navigation après une actualité et l'insère en BDD.

Usage::

    ingest-visites-totales 2026-06-01
    ingest-visites-totales 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.visites_totales import get_visites_totales

# Schéma de la table cible et requête d'upsert propres à ce report. Chaque
# commande d'ingestion gère la structure et l'insert de ses propres données ; le
# connecteur Metabase, lui, reste générique.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS visites_totales (
    date          DATE    NOT NULL,
    device        TEXT    NOT NULL,
    nb_visites    INTEGER NOT NULL,
    nb_pages_vues INTEGER NOT NULL,
    PRIMARY KEY (date, device)
);
"""

_UPSERT = """
INSERT INTO visites_totales (date, device, nb_visites, nb_pages_vues)
VALUES (%s, %s, %s, %s)
ON CONFLICT (date, device)
DO UPDATE SET
    nb_visites    = EXCLUDED.nb_visites,
    nb_pages_vues = EXCLUDED.nb_pages_vues;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame des totaux en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``.
    """
    return [
        (date, row["device"], int(row["nb_visites"]), int(row["nb_pages_vues"]))
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Calcule et upsert les visites et pages vues totales d'une journée."""
    df = get_visites_totales(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="visites-totales", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Calcule les visites et pages vues totales et par device depuis le "
            "réplica SQL Matomo et les insère dans la base PostgreSQL de Metabase."
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
