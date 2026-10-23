"""Typed configuration loaded from environment variables / a local ``.env``."""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute path to ``analysis/.env`` so settings resolve identically whatever the
# current working directory is — the CLI runs from ``analysis/`` but a Jupyter
# kernel runs from ``analysis/notebooks/``.
_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    """Connection settings for the Matomo PostgreSQL database.

    Values are read case-insensitively from the environment or a local
    ``.env`` file: ``PG_MATOMO_USER`` maps to ``pg_matomo_user`` and so on.
    Missing required values raise a validation error at instantiation time.
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    pg_matomo_user: str
    pg_matomo_password: str
    pg_matomo_host: str
    pg_matomo_db: str
    pg_matomo_port: int = 5432


class MetabaseDBSettings(BaseSettings):
    """Paramètres de connexion à la base PostgreSQL de Metabase.

    Variables d'environnement (fichier ``.env``) :
    ``METABASE_DB_HOST``, ``METABASE_DB_PORT``, ``METABASE_DB_USER``,
    ``METABASE_DB_PASSWORD``, ``METABASE_DB_NAME``.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    metabase_db_host: str = "localhost"
    metabase_db_port: int = 5433
    metabase_db_user: str = "metabase"
    metabase_db_password: str = "metabasepassword"
    metabase_db_name: str = "metabase"


class ReportingSettings(BaseSettings):
    """Connection settings for the Matomo HTTP Reporting API.

    Read case-insensitively from the environment or a local ``.env`` file:
    ``MATOMO_BASE_URL`` maps to ``matomo_base_url`` and so on. These are only
    needed for live reports; the analysis script also has a ``--demo`` mode
    that runs without any of them.

    - ``matomo_base_url``: root of the Matomo install, e.g.
      ``https://matomo.example.gouv.fr`` (no trailing ``/index.php``).
    - ``matomo_site_id``: the numeric ``idSite`` of code.travail.gouv.fr.
    - ``matomo_token_auth``: a Reporting API token with view access (or the
      literal ``anonymous`` if the site allows anonymous reporting).
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    matomo_base_url: str
    matomo_site_id: int
    # Défaut ``anonymous`` : suffit quand le site autorise le reporting anonyme.
    matomo_token_auth: str = "anonymous"


class ElasticsearchSettings(BaseSettings):
    """Connection settings for the cdtn-search Elasticsearch cluster.

    Read from ``ELASTICSEARCH_SEARCH_ENGINE_HOST`` / ``_USER`` / ``_PASSWORD`` —
    the same variable names already used by the shared search stack elsewhere in
    the monorepo. Only needed by the L2 pipeline's document-fetch stage
    (``analysis.l2.build_docs``).
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    elasticsearch_search_engine_host: str
    elasticsearch_search_engine_user: str
    elasticsearch_search_engine_password: str


class AlbertSettings(BaseSettings):
    """Connection settings for Albert (Etalab's LLM API).

    Read from ``.env``: ``ALBERT_API_URL`` / ``ALBERT_API_KEY`` /
    ``ALBERT_EMBEDDINGS_MODEL`` / ``ALBERT_LLM_MODEL``. Used by the L2 pipeline
    for document/facet/question embeddings and for facet extraction (chat
    completions).
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    albert_api_url: str = "https://albert.api.etalab.gouv.fr"
    albert_api_key: str
    albert_embeddings_model: str = "openweight-embeddings"
    albert_llm_model: str = "openai/gpt-oss-120b"


class AnthropicSettings(BaseSettings):
    """Connection settings for the Claude (Anthropic) API.

    Read from ``.env``: ``ANTHROPIC_API_KEY`` / ``ANTHROPIC_MODEL``. Used
    where a call site wants Claude instead of Albert for chat completions
    (e.g. ``analysis.l2.describe_classes``).

    ``anthropic_workspace_id`` is only needed for an API key that isn't
    scoped to a single workspace (an org-level key) -- such a key is
    otherwise rejected with a 400. Leave unset when using a workspace-scoped
    key (create one under a specific workspace in the Console), which is the
    normal case and needs no workspace id at all.
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    anthropic_api_key: str
    anthropic_model: str = "claude-opus-5"
    anthropic_workspace_id: str | None = None


class OpenAISettings(BaseSettings):
    """Connection settings for the OpenAI API.

    Read from ``.env``: ``OPENAI_API_KEY`` / ``OPENAI_EMBEDDINGS_MODEL``. Used
    where a call site wants OpenAI instead of Albert for embeddings (e.g. an
    alternative to ``analysis.connectors.albert.embed_texts``).
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str
    openai_embeddings_model: str = "text-embedding-3-large"
