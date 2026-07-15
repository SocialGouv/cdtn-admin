# analysis

Brique d'analytics pour **cdtn-admin**. Elle sert à deux choses :

- **Alimenter Metabase.** Récupérer des données depuis Matomo (via l'**API de
  reporting exclusivement**), les transformer, et produire des **agrégats**
  insérés dans la base PostgreSQL de Metabase. Ce sont ces agrégats qui
  alimentent les dashboards Metabase (notamment les **KPIs**).
- **Faire des analyses rapides** via des **notebooks** sur les données de Matomo,
  soit via l'API de reporting, soit via les données de visites disponibles dans
  une BDD PostgreSQL (réplica Matomo).

C'est un projet Python autonome géré avec [uv](https://docs.astral.sh/uv/). Il
vit en dehors du workspace pnpm/Lerna et n'a aucun lien avec les packages Node.

## Prérequis

- [uv](https://docs.astral.sh/uv/getting-started/installation/) (`brew install uv`)
- uv gère pour vous la version de Python (3.13, épinglée dans `.python-version`).

## Installation

```bash
cd analysis
uv sync                     # crée .venv et installe tout
cp .env.example .env        # puis renseigner les credentials
```

Le fichier `.env` regroupe trois jeux de variables :

| Variable                                                                                       | Rôle                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PG_MATOMO_USER` / `PG_MATOMO_PASSWORD` / `PG_MATOMO_HOST` / `PG_MATOMO_DB` / `PG_MATOMO_PORT` | **Source SQL** — connexion au réplica PostgreSQL de Matomo (données de visites, event data). Utilisé par les notebooks via `MatomoSQLConnector`.                                                                         |
| `MATOMO_BASE_URL` / `MATOMO_SITE_ID` / `MATOMO_TOKEN_AUTH`                                     | **Source API** — API HTTP de reporting Matomo (vues par URL, événements). Utilisé par les reports/ingesters via `MatomoReportingConnector`.                                                                              |
| `METABASE_DB_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `_NAME`                                 | **Destination** — base PostgreSQL de Metabase écrite par les commandes d'ingestion. **Optionnel en local** : les valeurs par défaut correspondent déjà au `docker compose up -d metabase-db` du repo (port hôte `5433`). |

## Lancer les notebooks

```bash
uv run jupyter lab
```

## Fonctionnement global

### 1. Créer un notebook

On lance JupyterLab (`uv run jupyter lab`) et on crée un notebook sous
`notebooks/`. Le notebook s'appuie sur les **fonctions communes** du package pour
accéder aux données sans réécrire la plomberie :

```python
# Source SQL — réplica Matomo (données de visites), connecteur SYNCHRONE
from analysis.connectors.matomo import MatomoSQLConnectorSync

with MatomoSQLConnectorSync() as matomo:
    df = matomo.run_query_df("SELECT 1")

# Source API — reporting Matomo (vues par URL, événements)
from analysis.connectors.matomo_reporting import MatomoReportingConnector

with MatomoReportingConnector() as matomo:
    urls = matomo.get_page_urls(period="day", date="2026-06-01")
```

> Un `MatomoSQLConnector` **asynchrone** (`asyncpg`) existe aussi et reste utilisé
> par les notebooks historiques (`async with … await matomo.run_query(...)`).
> Pour tout nouveau code, préférer `MatomoSQLConnectorSync` : un report bâti
> dessus reste une simple fonction synchrone `get_x(date) -> DataFrame`, appelable
> **sans `await`** — même geste qu'un report basé sur l'API Reporting.

Un notebook peut rester purement exploratoire. **Mais** si le but est de suivre
une donnée dans le temps (une métrique que l'on veut voir se mettre à jour
régulièrement dans un dashboard), l'objectif est de faire produire au notebook, en
sortie, un **tableau de données agrégées sur la journée** — une ligne par
dimension, pour un jour donné — qui pourra ensuite être inséré dans une table
Metabase (étape 2).

### 2. Alimenter Metabase

Un **cronjob** exécute chaque nuit `ingest-all`, qui alimente la base PostgreSQL
de Metabase avec les agrégats de la veille (les dashboards se rafraîchissent
alors automatiquement). Pour brancher une nouvelle donnée sur ce cronjob, il faut
deux morceaux :

1. **Un report** dans `src/analysis/reports/` : une fonction qui construit le
   **tableau agrégé** d'une journée (un `DataFrame`). On s'appuie sur le notebook
   de l'étape précédente pour figer la logique de calcul, puis on la porte ici en
   code de package. Le report ne connaît que Matomo — il ne touche pas à la BDD.
2. **Une commande d'ingestion** dans `src/analysis/commands/` : elle appelle le
   report pour un jour donné et prend en charge la **couche BDD** — définition de
   la table cible (`CREATE TABLE IF NOT EXISTS`), requête d'upsert
   (`INSERT ... ON CONFLICT`), et mapping du `DataFrame` vers les lignes. Le
   connecteur `MetabaseDBConnector` reste générique : c'est la commande qui
   fournit son schéma et son insert.

La commande expose un objet `Ingester` ; il suffit de l'enregistrer dans
`ingest_all.INGESTERS` pour qu'il soit exécuté par le cronjob. Voir
`commands/ingest_simulateurs.py` comme modèle complet.

### Reports disponibles

- **`completion_simulateurs`** — taux de complétion des simulateurs (start /
  result) par device, via l'API de reporting Matomo. Table `completion_simulateurs`.
- **`completion_contributions`** — pour chaque contribution générique du site (slugs
  du sitemap public) et chaque device, le nombre de visites Matomo sur les
  pages de la contribution (générique + personnalisées par convention
  collective) et le nombre de visites ayant cliqué « afficher les informations
  sans/avec convention collective ». Table `completion_contributions`.

## La base Metabase (destination)

Les commandes d'ingestion n'écrivent **pas** dans Matomo : elles **agrègent** la
donnée et stockent le résultat dans une base **PostgreSQL de Metabase** dédiée,
qui alimente ensuite les dashboards. C'est le _destination store_, distinct du
réplica Matomo (lecture seule) utilisé comme _source_.

En local, cette base est fournie par la stack **Docker Compose** du repo (définie
à la racine, pas ici). La démarrer depuis la **racine du dépôt** avant toute
commande d'ingestion :

```bash
# depuis la racine du repo
docker compose up -d metabase-db   # le Postgres où écrivent les commandes
docker compose up -d metabase      # optionnel : l'UI Metabase sur http://localhost:3030
```

Le service `metabase-db` expose Postgres sur le **port hôte `5433`** avec les
credentials ci-dessous — qui sont exactement les valeurs par défaut de
`MetabaseDBSettings` dans `config.py`, donc un run local ne nécessite **aucune**
entrée `METABASE_DB_*` dans `.env` :

| Réglage                | Valeur Docker locale |
| ---------------------- | -------------------- |
| `METABASE_DB_HOST`     | `localhost`          |
| `METABASE_DB_PORT`     | `5433`               |
| `METABASE_DB_USER`     | `metabase`           |
| `METABASE_DB_PASSWORD` | `metabasepassword`   |
| `METABASE_DB_NAME`     | `metabase`           |

Ne renseigner les variables `METABASE_DB_*` dans `.env` que pour cibler une autre
base (ex. un Metabase distant/staging). La table cible est créée automatiquement
au premier ingest, aucune étape de schéma manuelle n'est requise.

## Ingérer des données dans Metabase

Trois console scripts (déclarés dans `pyproject.toml`) agrègent la donnée et
l'**upsert** dans la base PostgreSQL de Metabase :

- **`ingest-all`** — lance **tous** les ingesters (actuellement `simulateurs` et
  `completion_contributions`). C'est le job planifié. **Sans argument, il cible J-2**
  (l'avant-veille, UTC — Matomo a alors archivé et stabilisé cette journée).
  C'est le point d'extension : pour ajouter un report, exposer un `Ingester`
  dans son module de commande et l'enregistrer dans `ingest_all.INGESTERS`.
- **`ingest-simulateurs`** — lance uniquement l'ingester de complétion des
  simulateurs pour un jour ou une période explicite. Pratique pour un run manuel
  ou un backfill.
- **`ingest-completion-contributions`** — lance uniquement l'ingester des visites par
  contribution et des clics « afficher les informations (CC) », pour un jour
  ou une période explicite.

```bash
# forme planifiée : agrège J-2 avec tous les ingesters (ce que lance le cronjob)
uv run ingest-all

# un jour / une période précise, tous les ingesters
uv run ingest-all 2026-06-01
uv run ingest-all 2026-06-01 --end 2026-06-30

# uniquement les simulateurs, jour / période explicite
uv run ingest-simulateurs 2026-06-01
uv run ingest-simulateurs 2026-06-01 --end 2026-06-30

# uniquement les visites/clics CC par contribution, jour / période explicite
uv run ingest-completion-contributions 2026-06-01
uv run ingest-completion-contributions 2026-06-01 --end 2026-06-30
```

Toutes ces commandes lisent deux jeux de réglages dans `.env` :

| Variable                                                       | Utilisé pour                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `MATOMO_BASE_URL` / `MATOMO_SITE_ID` / `MATOMO_TOKEN_AUTH`     | source — API de reporting Matomo                                          |
| `METABASE_DB_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `_NAME` | destination — Postgres Metabase (défaut : la BDD `docker-compose` locale) |

La table cible de chaque report est créée à son premier run (ex.
`completion_simulateurs`, clé primaire `date, device, titre` ; ou
`completion_contributions`, clé primaire `date, device, slug`), donc réingérer un
jour écrase ses lignes de façon idempotente — sûr à planifier quotidiennement.

### Tester le job nocturne en local (Docker Compose)

Le CronJob de prod lance `ingest-all` chaque nuit. Pour rejouer **exactement** ce
job en local — même image que la prod, écriture dans la base Metabase locale — le
`docker-compose.yml` du repo expose un service `analysis` (bâti sur
`analysis/Dockerfile`). Il est derrière un **profil** : il ne démarre donc pas
avec `docker compose up`, on le lance à la demande avec `docker compose run`, qui
démarre au passage la base `metabase-db` et attend qu'elle soit prête.

Prérequis : `analysis/.env` renseigné (credentials Matomo) — le service surcharge
tout seul `METABASE_DB_HOST`/`_PORT` pour viser la base du réseau Compose.

```bash
# depuis la racine du repo

# le job nocturne tel quel : ingest-all sur J-2
docker compose run --rm analysis

# une date / une période précise (mêmes arguments qu'en CLI)
docker compose run --rm analysis ingest-all 2026-06-01
docker compose run --rm analysis ingest-all 2026-06-01 --end 2026-06-30

# un seul ingester (itération rapide)
docker compose run --rm analysis ingest-simulateurs 2026-06-01
docker compose run --rm analysis ingest-completion-contributions 2026-06-01

# inspecter le résultat (UI Metabase optionnelle)
docker compose up -d metabase        # http://localhost:3030
```

Après modification du code, reconstruire l'image :
`docker compose build analysis`. Pour un run purement **exploratoire** sans Docker
(notebooks, itération sur un report), rester sur `uv run …` décrit plus haut.

### À la main dans le cluster (Kubernetes)

En prod, le CronJob `cron-analysis` lance `ingest-all` chaque nuit. Pour un run
manuel, on crée un Job **à partir de ce CronJob** : il hérite de l'image, du
secret `analysis` et des ressources. Chaque ingester étant un console script
distinct dans l'image (le conteneur lance `ingest-all` par défaut), il suffit de
**surcharger la commande du conteneur** pour n'en lancer qu'un — ou pour cibler
une période.

```bash
NS=cdtn-admin   # namespace de l'environnement visé

# 1) Tout, sur J-2 (comme le cron) — le plus simple
kubectl -n "$NS" create job analysis-manual --from=cronjob/cron-analysis

# 2) Tout, sur une période précise (surcharge des arguments)
kubectl -n "$NS" create job analysis-backfill --from=cronjob/cron-analysis \
  --dry-run=client -o json \
| jq '.spec.template.spec.containers[0].command = ["ingest-all","2026-06-01","--end","2026-06-30"]' \
| kubectl -n "$NS" apply -f -

# 3) UN SEUL ingester (ex. completion_contributions), sur J-2…
kubectl -n "$NS" create job completion-contributions-manual --from=cronjob/cron-analysis \
  --dry-run=client -o json \
| jq '.spec.template.spec.containers[0].command = ["ingest-completion-contributions"]' \
| kubectl -n "$NS" apply -f -
#    …ou sur une période : command = ["ingest-completion-contributions","2026-06-01","--end","2026-06-30"]

# Suivre les logs puis nettoyer
kubectl -n "$NS" logs -f job/completion-contributions-manual
kubectl -n "$NS" delete job completion-contributions-manual
```

`--from=cronjob/cron-analysis` marche même quand le CronJob est **suspendu**
(dev/preprod) : `suspend` ne bloque que le déclenchement planifié, pas les
créations manuelles. Sans `jq`, utiliser `-o yaml`, éditer la ligne `command:`
du conteneur, puis `kubectl apply -f -`.

## Lint / formatage

Mêmes checks que la CI :

```bash
uv run ruff check .
uv run ruff format --check .
```

## Arborescence

```
analysis/
├── pyproject.toml                # projet + deps + config ruff + console scripts
├── uv.lock                       # versions épinglées, reproductibles
├── src/analysis/
│   ├── config.py                 # settings typés (lecture .env)
│   ├── connectors/
│   │   ├── matomo.py             # MatomoSQLConnector (source SQL, réplica)
│   │   ├── matomo_reporting.py   # MatomoReportingConnector (source API)
│   │   └── metabase_db.py        # MetabaseDBConnector (destination, générique)
│   ├── reports/                  # calcul des agrégats journaliers (DataFrame)
│   └── commands/                 # commandes d'ingestion (report + couche BDD)
│       ├── ingest_all.py               # lance tous les ingesters — job planifié
│       ├── ingest_simulateurs.py       # ingester simulateurs (modèle)
│       └── ingest_completion_contributions.py # ingester visites/clics CC par contribution
└── notebooks/                    # analyses exploratoires
```
