"""Connectors to the Matomo PostgreSQL replica.

Two flavours read the same database (``PG_MATOMO_*`` settings):

* :class:`MatomoSQLConnector` — **async** (``asyncpg``), historical, used by the
  existing notebooks with top-level ``await``.
* :class:`MatomoSQLConnectorSync` — **synchronous** (``psycopg``). Prefer it for
  reports and for new notebook cells: a report built on it stays a plain
  ``get_x(date) -> DataFrame`` function, callable without ``await`` — exactly like
  the Reporting-API reports (``completion_simulateurs`` etc.). This keeps the
  notebook experience uniform and sidesteps ``asyncio.run`` (which fails inside
  Jupyter's already-running event loop).
"""

from __future__ import annotations

from collections.abc import Sequence
from types import TracebackType
from typing import Any

import asyncpg
import pandas as pd
import psycopg

from analysis.config import Settings


class MatomoSQLConnector:
    """Lightweight async wrapper around an ``asyncpg`` connection pool.

    Plain usage::

        matomo = MatomoSQLConnector()
        await matomo.connect()
        rows = await matomo.run_query("SELECT 1")
        await matomo.close()

    Or as an async context manager::

        async with MatomoSQLConnector() as matomo:
            df = await matomo.run_query_df("SELECT 1")
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or Settings()
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        """Open the connection pool to the Matomo database."""
        self._pool = await asyncpg.create_pool(
            user=self._settings.pg_matomo_user,
            password=self._settings.pg_matomo_password,
            database=self._settings.pg_matomo_db,
            host=self._settings.pg_matomo_host,
            port=self._settings.pg_matomo_port,
        )

    async def run_query(self, query: str) -> list[asyncpg.Record]:
        """Run a query and return the raw ``asyncpg`` records."""
        if self._pool is None:
            raise RuntimeError("connect() must be called before run_query()")
        async with self._pool.acquire() as conn:
            return await conn.fetch(query)

    async def run_query_df(self, query: str) -> pd.DataFrame:
        """Run a query and return the result as a pandas DataFrame."""
        records = await self.run_query(query)
        return pd.DataFrame([dict(record) for record in records])

    async def close(self) -> None:
        """Close the connection pool."""
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    async def __aenter__(self) -> MatomoSQLConnector:
        await self.connect()
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        await self.close()


class MatomoSQLConnectorSync:
    """Synchronous wrapper (``psycopg``) around the Matomo PostgreSQL replica.

    Same database as :class:`MatomoSQLConnector`, but **without** ``async``/
    ``await`` — so a report built on it is a plain synchronous function and reads
    the same in a notebook as a Reporting-API report::

        from analysis.connectors.matomo import MatomoSQLConnectorSync

        with MatomoSQLConnectorSync() as matomo:
            df = matomo.run_query_df("SELECT 1")

    The single connection opened by the context manager is reused across queries
    and closed on exit.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or Settings()
        self._conn: psycopg.Connection | None = None

    def _conninfo(self) -> str:
        s = self._settings
        return (
            f"host={s.pg_matomo_host} port={s.pg_matomo_port} "
            f"dbname={s.pg_matomo_db} user={s.pg_matomo_user} "
            f"password={s.pg_matomo_password}"
        )

    def connect(self) -> None:
        """Open the connection (idempotent)."""
        if self._conn is None:
            self._conn = psycopg.connect(self._conninfo())

    def run_query(self, query: str, params: Sequence[Any] | None = None) -> list[tuple]:
        """Run a query and return the raw rows (opens the connection if needed)."""
        self.connect()
        assert self._conn is not None
        with self._conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def run_query_df(
        self, query: str, params: Sequence[Any] | None = None
    ) -> pd.DataFrame:
        """Run a query and return the result as a pandas DataFrame."""
        self.connect()
        assert self._conn is not None
        with self._conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            columns = [col.name for col in cur.description] if cur.description else []
        return pd.DataFrame(rows, columns=columns)

    def close(self) -> None:
        """Close the connection."""
        if self._conn is not None:
            self._conn.close()
            self._conn = None

    def __enter__(self) -> MatomoSQLConnectorSync:
        self.connect()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        self.close()
