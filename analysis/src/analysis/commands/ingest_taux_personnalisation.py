"""CLI : calcule le taux de personnalisation des simulateurs et l'insère en BDD.

Usage::

    ingest-taux-personnalisation 2026-06-01
    ingest-taux-personnalisation 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.taux_personnalisation_simulateurs import (
    get_taux_personnalisation_simulateurs,
)

# Schéma de la table cible et requête d'upsert propres à ce report. Chaque
# commande d'ingestion gère la structure et l'insert de ses propres données ; le
# connecteur Metabase, lui, reste générique.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS taux_personnalisation_simulateurs (
    date                  DATE    NOT NULL,
    device                TEXT    NOT NULL,
    titre                 TEXT    NOT NULL,
    nb_personnalisee      INTEGER NOT NULL,
    nb_non_personnalisee  INTEGER NOT NULL,
    nb_cdt                INTEGER NOT NULL,
    nb_visites_total_complete INTEGER NOT NULL,
    nb_non_complete       INTEGER NOT NULL,
    PRIMARY KEY (date, device, titre)
);
"""

_UPSERT = """
INSERT INTO taux_personnalisation_simulateurs
    (date, device, titre, nb_personnalisee, nb_non_personnalisee, nb_cdt,
     nb_visites_total_complete, nb_non_complete)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device, titre)
DO UPDATE SET
    nb_personnalisee          = EXCLUDED.nb_personnalisee,
    nb_non_personnalisee      = EXCLUDED.nb_non_personnalisee,
    nb_cdt                    = EXCLUDED.nb_cdt,
    nb_visites_total_complete = EXCLUDED.nb_visites_total_complete,
    nb_non_complete           = EXCLUDED.nb_non_complete;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``. Le taux de
    personnalisation n'est pas stocké : il se déduit de
    ``nb_personnalisee / nb_visites_total_complete``.
    """
    return [
        (
            date,
            row["device"],
            row["titre"],
            int(row["nb_personnalisee"]),
            int(row["nb_non_personnalisee"]),
            int(row["nb_cdt"]),
            int(row["nb_visites_total_complete"]),
            int(row["nb_non_complete"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Agrège et upsert le taux de personnalisation pour une journée."""
    df = get_taux_personnalisation_simulateurs(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="taux-personnalisation", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Calcule le taux de personnalisation des simulateurs depuis le réplica "
            "SQL Matomo et l'insère dans la base PostgreSQL de Metabase."
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
