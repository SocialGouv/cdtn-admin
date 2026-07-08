"""Briques communes aux commandes d'ingestion vers Metabase.

Une commande d'ingestion (``ingest-simulateurs``, ``ingest-all``, …) se ramène à :
un ensemble de jours × un ensemble d'``Ingester``. Chaque ``Ingester`` sait
persister **une** journée d'un report donné ; ``run_ingest`` orchestre la boucle
et mutualise les connecteurs (un seul client Matomo HTTP, un seul connecteur
Metabase) sur toute la période.

Pour ajouter un nouveau report, il suffit d'exposer un ``Ingester`` et de
l'enregistrer dans ``analysis.commands.ingest_all``.
"""

from __future__ import annotations

import argparse
import re
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from datetime import date as Date
from datetime import timedelta

from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.connectors.metabase_db import MetabaseDBConnector

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Ingère UNE journée d'un report : (connecteur Matomo, connecteur Metabase, date
# ISO) -> nombre de lignes insérées/mises à jour.
IngestDayFn = Callable[[MatomoReportingConnector, MetabaseDBConnector, str], int]


@dataclass(frozen=True)
class Ingester:
    """Un report persistable : son nom (pour les logs) + son ingestion journalière."""

    name: str
    run: IngestDayFn


def parse_date(value: str, label: str, parser: argparse.ArgumentParser) -> Date:
    """Valide/parse une date ISO ``YYYY-MM-DD`` ou arrête le parser sur erreur."""
    if not _DATE_RE.match(value):
        parser.error(
            f"Format de date invalide pour {label} : '{value}'. Attendu : YYYY-MM-DD."
        )
    return Date.fromisoformat(value)


def iter_days(start: Date, end: Date):
    """Itère chaque jour de ``start`` à ``end`` (bornes incluses)."""
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def run_ingest(days: Sequence[Date], ingesters: Sequence[Ingester]) -> int:
    """Exécute chaque ``ingester`` pour chaque jour et renvoie le total de lignes.

    Un seul ``MatomoReportingConnector`` (donc un seul client HTTP) et un seul
    ``MetabaseDBConnector`` sont réutilisés sur toute la période.
    """
    metabase = MetabaseDBConnector()
    total = 0
    with MatomoReportingConnector() as matomo:
        for day in days:
            day_str = day.isoformat()
            for ingester in ingesters:
                print(f"[{day_str}] {ingester.name}…", end=" ", flush=True)
                n = ingester.run(matomo, metabase, day_str)
                total += n
                print(f"{n} lignes insérées/mises à jour.")
    return total
