"""CLI : récupère les taux de complétion des simulateurs et les insère en BDD.

Usage::

    ingest-simulateurs 2026-06-01
    ingest-simulateurs 2026-06-01 --end 2026-06-30
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date as Date
from datetime import timedelta

import pandas as pd

from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.completion_simulateurs import get_completion_simulateurs

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

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


def _parse_date(value: str, label: str, parser: argparse.ArgumentParser) -> Date:
    if not _DATE_RE.match(value):
        parser.error(f"Format de date invalide pour {label} : '{value}'. Attendu : YYYY-MM-DD.")
    return Date.fromisoformat(value)


def _iter_days(start: Date, end: Date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


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
        help='Date de fin (inclusive) au format ISO YYYY-MM-DD. Si absente, traite uniquement la date de début.',
    )
    args = parser.parse_args()

    start = _parse_date(args.date, "date", parser)
    end = _parse_date(args.end_date, "--end", parser) if args.end_date else start

    if end < start:
        parser.error(f"La date de fin ({end}) est antérieure à la date de début ({start}).")

    days = list(_iter_days(start, end))
    connector = MetabaseDBConnector()
    total = 0

    # Un seul connecteur Matomo (donc un seul client HTTP) réutilisé sur toute la
    # période plutôt qu'un par jour.
    with MatomoReportingConnector() as matomo:
        for day in days:
            day_str = day.isoformat()
            print(f"[{day_str}] Récupération des données...", end=" ", flush=True)
            df = get_completion_simulateurs(day_str, matomo)
            rows = _rows_from_df(df, day_str)
            n = connector.upsert(
                table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows
            )
            total += n
            print(f"{n} lignes insérées/mises à jour.")

    print(f"\nTerminé : {total} lignes sur {len(days)} jour(s).")


if __name__ == "__main__":
    sys.exit(main())
