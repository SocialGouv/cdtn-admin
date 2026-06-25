"""Async connector to the Matomo PostgreSQL database."""

from __future__ import annotations

from types import TracebackType

import asyncpg
import pandas as pd

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
