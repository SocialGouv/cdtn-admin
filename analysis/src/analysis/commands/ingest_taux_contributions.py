"""CLI : calcule les taux de complétion/personnalisation des contributions en BDD.

Usage::

    ingest-taux-contributions 2026-06-01
    ingest-taux-contributions 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.taux_contributions import get_taux_contributions

# Schéma de la table cible et requête d'upsert propres à ce report.
#
# Les taux ne sont PAS stockés (valeurs dérivables, calculées dans Metabase) :
# complétion = (cc + cdt_cc_non_traitee + cdt) / total ; personnalisation =
# cc / total. Les trois colonnes de cas sont exclusives (priorité cc > cdt car
# CC non traitée > cdt) : une visite n'est comptée que dans l'une d'elles.
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS taux_contributions (
    date                           DATE    NOT NULL,
    device                         TEXT    NOT NULL,
    slug                           TEXT    NOT NULL,
    nb_visites_total               INTEGER NOT NULL,
    nb_visites_cc                  INTEGER NOT NULL,
    nb_visites_cdt_cc_non_traitee  INTEGER NOT NULL,
    nb_visites_cdt                 INTEGER NOT NULL,
    PRIMARY KEY (date, device, slug)
);
"""

_UPSERT = """
INSERT INTO taux_contributions
    (date, device, slug, nb_visites_total, nb_visites_cc,
     nb_visites_cdt_cc_non_traitee, nb_visites_cdt)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device, slug)
DO UPDATE SET
    nb_visites_total              = EXCLUDED.nb_visites_total,
    nb_visites_cc                 = EXCLUDED.nb_visites_cc,
    nb_visites_cdt_cc_non_traitee = EXCLUDED.nb_visites_cdt_cc_non_traitee,
    nb_visites_cdt                = EXCLUDED.nb_visites_cdt;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame du report en lignes prêtes pour ``_UPSERT``.

    L'ordre des valeurs suit les colonnes de ``_UPSERT``.
    """
    return [
        (
            date,
            row["device"],
            row["slug"],
            int(row["nb_visites_total"]),
            int(row["nb_visites_cc"]),
            int(row["nb_visites_cdt_cc_non_traitee"]),
            int(row["nb_visites_cdt"]),
        )
        for _, row in df.iterrows()
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Agrège et upsert les taux des contributions pour une journée."""
    df = get_taux_contributions(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="taux-contributions", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Calcule les taux de complétion et de personnalisation des "
            "contributions depuis le réplica SQL Matomo et les insère dans la "
            "base PostgreSQL de Metabase."
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
