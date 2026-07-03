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

| Variable             | Description                       |
| -------------------- | --------------------------------- |
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

## Reports

### Monthly views — générique vs. personnalisées (par contribution)

`analysis/src/analysis/reports/contrib_monthly_views.py` builds, **for every
contribution** on the site, the monthly views of the single **générique** page
against the **summed** views of all per-convention-collective **personnalisées**
pages, over January → June 2026, with a cumulative total. The full list of
contributions is enumerated from the public
[sitemap](https://code.travail.gouv.fr/sitemap.xml) (the ~46 generic
`/contribution/{slug}` pages). Personalized URLs are matched across the slug
migration (flat `/contribution/{idcc}-{slug}` **and** nested
`/contribution/{slug}/{idcc}-{cc}`). It uses the Matomo **HTTP Reporting API**
(`MATOMO_*` in `.env`), not the SQL replica.

```bash
# synthetic data, no credentials nor network needed — proves the pipeline
uv run python -m analysis.reports.contrib_monthly_views --demo

# live — reads MATOMO_BASE_URL / MATOMO_SITE_ID / MATOMO_TOKEN_AUTH from .env
uv run python -m analysis.reports.contrib_monthly_views --start 2026-01-01 --end 2026-06-30
```

Outputs one wide CSV under `analysis/output/` — one row per contribution with
`{YYYY-MM}_generic` / `{YYYY-MM}_perso` columns for each month plus
`cumul_generic` / `cumul_perso` / `cumul_total`, sorted by total desc — and a
top-N `générique` vs `perso Σ CC` stacked-bar PNG. It also prints the top table.
Use `--metric visits` for `nb_visits`, `--top N` to size the chart, `--refresh` to
bypass the cache.

The raw Matomo result is **cached** to `analysis/output/.cache/` keyed by the date
range, so re-running with a different metric or chart is instant. The companion
playground is `notebooks/contrib_monthly_views.ipynb`
(`uv run jupyter lab notebooks/contrib_monthly_views.ipynb`); set `DEMO = True`
there for an instant, credential-free preview.

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
