"""CLI : lance TOUS les ingesters vers Metabase — c'est le job planifié.

Par défaut (sans argument), ingère la journée **J-2** (avant-veille, UTC) : les
données Matomo de l'avant-veille sont alors archivées et stabilisées. On peut
aussi cibler une date ou une période précise (utile pour un rejeu/backfill).

Usage::

    ingest-all                          # J-2 (défaut du cron)
    ingest-all 2026-06-01               # une journée précise
    ingest-all 2026-06-01 --end 2026-06-30   # une période

Pour ajouter un report : exposer un ``Ingester`` dans son module de commande et
l'ajouter à ``INGESTERS`` ci-dessous.
"""

from __future__ import annotations

import argparse
import sys
from datetime import UTC, datetime, timedelta
from datetime import date as Date

from analysis.commands import ingest_completion_contributions, ingest_simulateurs
from analysis.commands._runner import Ingester, iter_days, parse_date, run_ingest

# Registre des reports à ingérer. Ajouter ici le ``INGESTER`` de chaque nouveau
# report (un import + une entrée suffisent).
INGESTERS: list[Ingester] = [
    ingest_simulateurs.INGESTER,
    ingest_completion_contributions.INGESTER,
]

# Décalage par défaut : J-2 (avant-veille).
_DEFAULT_LAG_DAYS = 2


def _default_day() -> Date:
    """Avant-veille en UTC (J-2)."""
    return datetime.now(UTC).date() - timedelta(days=_DEFAULT_LAG_DAYS)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Lance tous les ingesters vers la base Metabase."
            "Sans argument, ingère la journée J-2 (avant-veille, UTC)."
        )
    )
    parser.add_argument(
        "date",
        nargs="?",
        default=None,
        help="Date de début YYYY-MM-DD. Défaut : J-2 (avant-veille, UTC).",
    )
    parser.add_argument(
        "--end",
        dest="end_date",
        default=None,
        help=(
            "Date de fin (inclusive) YYYY-MM-DD. Si absente, traite uniquement la "
            "date de début."
        ),
    )
    args = parser.parse_args()

    start = parse_date(args.date, "date", parser) if args.date else _default_day()
    end = parse_date(args.end_date, "--end", parser) if args.end_date else start

    if end < start:
        parser.error(
            f"La date de fin ({end}) est antérieure à la date de début ({start})."
        )

    days = list(iter_days(start, end))
    names = ", ".join(ingester.name for ingester in INGESTERS)
    print(f"Ingesters : {names}")
    total = run_ingest(days, INGESTERS)
    print(f"\nTerminé : {total} lignes sur {len(days)} jour(s).")


if __name__ == "__main__":
    sys.exit(main())
