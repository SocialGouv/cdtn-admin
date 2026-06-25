"""Typed configuration loaded from environment variables / a local ``.env``."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Connection settings for the Matomo PostgreSQL database.

    Values are read case-insensitively from the environment or a local
    ``.env`` file: ``PG_MATOMO_USER`` maps to ``pg_matomo_user`` and so on.
    Missing required values raise a validation error at instantiation time.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    pg_matomo_user: str
    pg_matomo_password: str
    pg_matomo_host: str
    pg_matomo_db: str
    pg_matomo_port: int = 5432
