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

> **Limite connue — agrégation « Autres » de Matomo.** Matomo plafonne le nombre de
> lignes conservées par rapport à l'archivage (`datatable_archiving_maximum_rows_actions`)
> et replie la longue traîne des pages `/contribution/` dans un bucket
> `/contribution/ - Autres` que `filter_limit=-1` ne peut pas désagréger. Le rapport
> est donc fiable pour les contributions à **fort trafic**, mais **sous-compte la
> traîne** (pages perso par CC, contributions à faible trafic qui lisent alors 0).
> `autres_by_month()` chiffre ce volume non ventilé (≈ la moitié du total sur
> jan–juin 2026). Correctif complet : relever la limite d'archivage côté serveur
> Matomo, ou passer par un segment / le log d'actions brut.

The raw Matomo result is **cached** to `analysis/output/.cache/` keyed by the date
range, so re-running with a different metric or chart is instant. The companion
playground is `notebooks/contrib_monthly_views.ipynb`
(`uv run jupyter lab notebooks/contrib_monthly_views.ipynb`); set `DEMO = True`
there for an instant, credential-free preview.

### Simulator completion rate (per day / device)

`analysis/src/analysis/reports/completion_simulateurs.py` computes, **for a given
day**, the completion funnel of each simulator on the site. For every simulator in
its `CONFIGS` list and every device segment (`global`, `desktop`, `mobile`) it
returns the number of visits, `Start` events and `Result` events. The completion
rate itself is **not** stored — it is simply `Result / Start`, derived at display
time in Metabase. Like the report above it uses the Matomo **HTTP Reporting API**
(`MATOMO_*` in `.env`), through the reusable `MatomoReportingConnector`
(`Events.getAction` + `Actions.getPageUrls`), not the SQL replica.

```python
from analysis.reports.completion_simulateurs import get_completion_simulateurs

df = get_completion_simulateurs("2026-06-01")
# columns: device, titre, visites, Start, Result
```

It is the data source consumed by the `ingest-simulateurs` command below.

## The Metabase database (destination)

The ingest commands don't write to Matomo — they **aggregate** data and store the
result into a dedicated **Metabase PostgreSQL database**, which then powers the
Metabase dashboards. This is the *destination* store, separate from the read-only
Matomo replica used as a *source*.

Locally this database ships with the repo's **Docker Compose** stack (defined at
the repo root, not here). Bring it up from the **repository root** before running
any ingest command:

```bash
# from the repo root
docker compose up -d metabase-db   # the Postgres store the commands write to
docker compose up -d metabase      # optional: the Metabase UI on http://localhost:3030
```

The `metabase-db` service exposes Postgres on **host port `5433`** with these
credentials — which are exactly the defaults of `MetabaseDBSettings` in
`config.py`, so a local run needs **no `METABASE_DB_*` entry in `.env`**:

| Setting             | Local Docker value  |
| ------------------- | ------------------- |
| `METABASE_DB_HOST`  | `localhost`         |
| `METABASE_DB_PORT`  | `5433`              |
| `METABASE_DB_USER`  | `metabase`          |
| `METABASE_DB_PASSWORD` | `metabasepassword` |
| `METABASE_DB_NAME`  | `metabase`          |

Set the `METABASE_DB_*` variables in `.env` only to target another database (e.g.
a remote/staging Metabase). The target table is created automatically on the
first ingest, so no manual schema step is required.

## Ingest simulator completion into Metabase

`ingest-simulateurs` is a console script (declared in `pyproject.toml`) that runs
the completion aggregation above for one day or a date range and **upserts** the
result into the `completion_simulateurs` table of the Metabase PostgreSQL
database — the daily job that feeds the Metabase dashboards.

```bash
# a single day
uv run ingest-simulateurs 2026-06-01

# an inclusive date range (one upsert per day)
uv run ingest-simulateurs 2026-06-01 --end 2026-06-30
```

It reads two sets of settings from `.env`:

| Variable                                                     | Used for                                              |
| ------------------------------------------------------------ | ----------------------------------------------------- |
| `MATOMO_BASE_URL` / `MATOMO_SITE_ID` / `MATOMO_TOKEN_AUTH`    | source — Matomo Reporting API (completion data)       |
| `METABASE_DB_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `_NAME` | destination — Metabase Postgres (defaults to the local `docker-compose` DB) |

The target table is created on first run (`date, device, titre` primary key), so
re-ingesting a day overwrites its rows idempotently — safe to schedule daily.

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
