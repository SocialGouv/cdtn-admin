"""CLI : calcule la poursuite de navigation après une actualité et l'insère en BDD.

Usage::

    ingest-parcours-actualites 2026-06-01
    ingest-parcours-actualites 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.parcours_actualites import get_parcours_actualites

# Schéma de la table cible et requête d'upsert propres à ce report. Chaque
# commande d'ingestion gère la structure et l'insert de ses propres données ; le
# connecteur Metabase, lui, reste générique.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS parcours_actualites (
    date                 DATE    NOT NULL,
    device               TEXT    NOT NULL,
    referrer_type        TEXT    NOT NULL,
    slug                 TEXT    NOT NULL,
    nb_visites_total     INTEGER NOT NULL,
    nb_visites_actualite INTEGER NOT NULL,
    nb_visites_suite     INTEGER NOT NULL,
    PRIMARY KEY (date, device, referrer_type, slug)
);
"""

_UPSERT = """
INSERT INTO parcours_actualites
    (date, device, referrer_type, slug, nb_visites_total, nb_visites_actualite,
     nb_visites_suite)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device, referrer_type, slug)
DO UPDATE SET
    nb_visites_total     = EXCLUDED.nb_visites_total,
    nb_visites_actualite = EXCLUDED.nb_visites_actualite,
    nb_visites_suite     = EXCLUDED.nb_visites_suite;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame du parcours en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``. Les taux ne sont pas
    stockés : part d'entrée = ``nb_visites_actualite / nb_visites_total``,
    poursuite = ``nb_visites_suite / nb_visites_actualite``.
    """
    return [
        (
            date,
            row["device"],
            row["referrer_type"],
            row["slug"],
            int(row["nb_visites_total"]),
            int(row["nb_visites_actualite"]),
            int(row["nb_visites_suite"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Calcule et upsert le parcours après actualité d'une journée."""
    df = get_parcours_actualites(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="parcours-actualites", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Calcule la poursuite de navigation des visites démarrant sur une "
            "actualité depuis le réplica SQL Matomo et l'insère dans la base "
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
