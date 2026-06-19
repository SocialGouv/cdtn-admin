# analysis

Notebook-based analytics for **cdtn-admin**. Connects to the Matomo
PostgreSQL database and explores search-behaviour statistics with pandas,
seaborn and matplotlib.

This is a standalone Python project managed with [uv](https://docs.astral.sh/uv/).
It lives outside the pnpm/Lerna workspace and has no link to the Node packages.

## Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/) (`brew install uv`)
- uv manages the Python version (3.13, pinned in `.python-version`) for you.

## Setup

```bash
cd analysis
uv sync                     # creates .venv and installs everything
cp .env.example .env        # then fill in the PG_MATOMO_* credentials
```

The `.env` holds the connection to the Matomo database:

| Variable           | Description                       |
| ------------------ | --------------------------------- |
| `PG_MATOMO_USER`     | database user                     |
| `PG_MATOMO_PASSWORD` | database password                 |
| `PG_MATOMO_HOST`     | host (e.g. the Matomo PG replica) |
| `PG_MATOMO_DB`       | database name                     |
| `PG_MATOMO_PORT`     | port (default `5432`)             |

## Run the notebooks

```bash
uv run jupyter lab          # open notebooks/search_stats.ipynb
```

`search_stats.ipynb` aggregates `search` / `selectResult` events from
`matomo_partitioned` into search sessions and charts how results are selected.

## Usage in code

```python
from analysis.connectors.matomo import MatomoSQLConnector

async with MatomoSQLConnector() as matomo:
    df = await matomo.run_query_df("SELECT 1")
```

## Linting / formatting

Run the same checks as CI:

```bash
uv run ruff check .
uv run ruff format --check .
```

## Layout

```
analysis/
├── pyproject.toml            # project + deps + ruff config
├── uv.lock                   # pinned, reproducible versions
├── src/analysis/
│   ├── config.py             # typed settings (reads .env)
│   └── connectors/matomo.py  # MatomoSQLConnector
└── notebooks/
    └── search_stats.ipynb
```
