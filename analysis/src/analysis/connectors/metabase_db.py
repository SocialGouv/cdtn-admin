"""Connecteur synchrone générique vers la base PostgreSQL de Metabase.

Ce connecteur ne connaît aucun schéma métier : chaque commande d'ingestion
fournit elle-même le DDL de sa table cible, sa requête ``INSERT ... ON CONFLICT``
et les lignes à écrire. On peut ainsi avoir plusieurs reports, chacun avec sa
propre commande et sa propre structure de table, sans coupler le connecteur à un
report particulier.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import psycopg

from analysis.config import MetabaseDBSettings


class MetabaseDBConnector:
    """Écrit des lignes dans la base PostgreSQL de Metabase.

    Générique : le schéma de la table cible et la requête d'insertion sont
    fournis par l'appelant (voir p. ex.
    ``analysis.commands.ingest_simulateurs``).
    """

    def __init__(self, settings: MetabaseDBSettings | None = None) -> None:
        self._settings = settings or MetabaseDBSettings()

    def _conninfo(self) -> str:
        s = self._settings
        return (
            f"host={s.metabase_db_host} port={s.metabase_db_port} "
            f"dbname={s.metabase_db_name} user={s.metabase_db_user} "
            f"password={s.metabase_db_password}"
        )

    def upsert(
        self,
        *,
        table_ddl: str,
        insert_sql: str,
        rows: Sequence[Sequence[Any]],
    ) -> int:
        """Crée la table cible si besoin, puis insère/met à jour les lignes.

        Le tout dans une seule transaction : le ``CREATE TABLE`` et les
        ``executemany`` sont validés ensemble.

        Args:
            table_ddl: ``CREATE TABLE IF NOT EXISTS ...`` de la table cible.
            insert_sql: ``INSERT ... ON CONFLICT ... DO UPDATE`` paramétré
                (placeholders ``%s``).
            rows: séquences de valeurs, une par ligne, dans l'ordre des colonnes
                de ``insert_sql``.

        Returns:
            Nombre de lignes transmises.
        """
        with psycopg.connect(self._conninfo()) as conn:
            with conn.cursor() as cur:
                cur.execute(table_ddl)
                cur.executemany(insert_sql, rows)
            conn.commit()

        return len(rows)
