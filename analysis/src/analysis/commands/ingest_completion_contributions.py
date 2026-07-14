"""CLI : ingère les visites/clics CC par contribution dans la BDD Metabase.

Usage::

    ingest-completion-contributions 2026-06-01
    ingest-completion-contributions 2026-06-01 --end 2026-06-30

Expose aussi ``INGESTER`` pour être orchestré par ``ingest-all``.
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest
from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports.completion_contributions import get_completion_contributions

# Schéma de la table cible et requête d'upsert propres à ce report.
#
# ``nb_visits_click_total`` (= sans_cc + avec_cc, calculé dans le report pour
# fidélité avec le calcul d'origine) n'est PAS stocké : c'est une valeur
# dérivable, Metabase la recalcule (colonne custom sans_cc + avec_cc).
_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS completion_contributions (
    date                     DATE    NOT NULL,
    device                   TEXT    NOT NULL,
    slug                     TEXT    NOT NULL,
    nb_visites_uniques       INTEGER NOT NULL,
    nb_visits_click_sans_cc  INTEGER NOT NULL,
    nb_visits_click_avec_cc  INTEGER NOT NULL,
    nb_visits_click_avec_cc_non_supporte  INTEGER NOT NULL,
    PRIMARY KEY (date, device, slug)
);
"""

_UPSERT = """
INSERT INTO completion_contributions
    (date, device, slug, nb_visites_uniques,
     nb_visits_click_sans_cc, nb_visits_click_avec_cc,
     nb_visits_click_avec_cc_non_supporte)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (date, device, slug)
DO UPDATE SET
    nb_visites_uniques      = EXCLUDED.nb_visites_uniques,
    nb_visits_click_sans_cc = EXCLUDED.nb_visits_click_sans_cc,
    nb_visits_click_avec_cc = EXCLUDED.nb_visits_click_avec_cc,
    nb_visits_click_avec_cc_non_supporte =
      EXCLUDED.nb_visits_click_avec_cc_non_supporte;
"""


def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    """Convertit le DataFrame de visites/clics CC en lignes pour ``_UPSERT``.

    La ligne ``slug="TOTAL"`` (résumé par device, ajoutée par le report pour
    l'exploration en notebook) est exclue : c'est une agrégation sur la
    dimension ``slug`` elle-même, redondante avec une somme Metabase sur les
    autres lignes, et sa persistance sous une fausse valeur de ``slug``
    fausserait tout ``SUM(...) GROUP BY date, device`` naïf côté dashboard.
    """
    return [
        (
            date,
            row["device"],
            row["slug"],
            int(row["nb_visites_uniques"]),
            int(row["nb_visits_click_sans_CC"]),
            int(row["nb_visits_click_avec_CC"]),
            int(row["nb_visits_click_avec_CC_non_supporte"]),
        )
        for _, row in df.iterrows()
        if row["slug"] != "TOTAL"
    ]


def ingest_day(
    matomo: MatomoReportingConnector, metabase: MetabaseDBConnector, day: str
) -> int:
    """Agrège et upsert les visites/clics CC par contribution pour une journée."""
    df = get_completion_contributions(day, matomo)
    rows = _rows_from_df(df, day)
    return metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)


# Enregistré dans ``ingest_all.INGESTERS``.
INGESTER = Ingester(name="completion_contributions", run=ingest_day)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Récupère les visites par contribution et les clics "
            "'afficher les informations (CC)' via l'API Matomo et les insère "
            "dans la base PostgreSQL de Metabase."
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
