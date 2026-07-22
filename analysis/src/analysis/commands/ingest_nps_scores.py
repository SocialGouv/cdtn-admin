"""CLI : ingère les scores NPS par device et par page dans la BDD Metabase.

Usage::

    ingest-nps-scores 2026-06-01
    ingest-nps-scores 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.nps_scores import get_nps_scores

# Schéma de la table cible et requête d'upsert propres à ce report. Le score NPS
# (promoteurs 9-10, détracteurs 0-6) n'est PAS stocké : c'est une valeur
# dérivable des lignes (score, nb_uniq_visitors), Metabase le recalcule.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS nps_scores (
    date             DATE    NOT NULL,
    device           TEXT    NOT NULL,
    score            INTEGER NOT NULL,
    url              TEXT    NOT NULL,
    nb_uniq_visitors INTEGER NOT NULL,
    PRIMARY KEY (date, device, score, url)
);
"""

_UPSERT = """
INSERT INTO nps_scores
    (date, device, score, url, nb_uniq_visitors)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (date, device, score, url)
DO UPDATE SET
    nb_uniq_visitors = EXCLUDED.nb_uniq_visitors;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame des scores NPS en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``.
    """
    return [
        (
            date,
            row["device"],
            int(row["score"]),
            row["url"],
            int(row["nb_uniq_visitors"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Agrège et upsert les scores NPS par device et par page pour une journée."""
    df = get_nps_scores(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="nps_scores", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Récupère les scores NPS (events score_0 … score_10) par device et "
            "par page via l'API Matomo et les insère dans la base PostgreSQL "
            "de Metabase."
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
