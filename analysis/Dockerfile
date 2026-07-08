# syntax=docker/dockerfile:1.7
# Image pour les jobs d'agrégation `analysis` (uv-managed, standalone — hors
# workspace pnpm). Le build context est le dossier `analysis/`.

# ---- Builder : résout les deps + installe le projet dans /app/.venv ----
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# 1) Deps tierces d'abord : cette couche est mise en cache tant que le lockfile
#    ne change pas.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# 2) Le projet lui-même (les console scripts atterrissent dans /app/.venv/bin).
COPY README.md ./
COPY src ./src
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


# ---- Runner : même image de base -> l'interpréteur du venv reste valide ----
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS runner

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src

USER 1000

# Ingestion quotidienne : `ingest-all` lance tous les ingesters et, sans
# argument, cible J-2 (avant-veille UTC, données Matomo stabilisées). Le cronjob
# s'appuie sur ce CMD par défaut ; pour un rejeu/backfill, surcharger les args
# (ex: `ingest-all 2026-06-01 --end 2026-06-30`).
CMD ["ingest-all"]
