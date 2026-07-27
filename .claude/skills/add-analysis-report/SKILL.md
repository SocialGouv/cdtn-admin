---
name: add-analysis-report
description: >-
  Génère un nouveau report + sa commande d'ingestion dans le projet `analysis/`
  de cdtn-admin, à partir d'un calcul Python fourni par l'utilisateur. Le skill
  transforme ce calcul en un report qui renvoie un DataFrame, DÉDUIT le schéma
  de la table Postgres et l'upsert À PARTIR DES DONNÉES DE SORTIE, puis câble le
  tout (Ingester, registre ingest-all, console script, README). Utilise ce skill
  dès que l'utilisateur veut : ajouter/créer un report ou un script d'agrégation,
  une nouvelle commande d'ingestion vers Metabase, persister un calcul dans une
  table, ou transformer un snippet/notebook Python en données quotidiennes —
  même sans dire « skill » (déclencheurs : « nouveau report », « ingérer X dans
  Metabase », « créer une table pour ces données », « ajoute un calcul »,
  « aggrège Y par jour »). Ce skill s'applique au dossier `analysis/`.
---

# Ajouter un report d'analyse (cdtn-admin)

Ce skill industrialise l'ajout d'un report dans `analysis/` : à partir d'un
**calcul Python** (une fonction / un snippet qui produit des chiffres par jour),
il génère un **report** (qui renvoie un `pandas.DataFrame`) et sa **commande
d'ingestion** (qui crée la table cible et l'upsert dans la base Metabase), puis
l'enregistre pour qu'il tourne dans `ingest-all` (job planifié J-2).

Le cœur du travail — et le point sur lequel il faut être rigoureux — est de
**dériver le schéma de la table et les requêtes d'insertion à partir de la forme
réelle des données de sortie** (colonnes, types, clé naturelle). Un schéma faux
casse l'idempotence de l'upsert et les dashboards.

## Avant tout : lire l'exemple canonique vivant

Ne pars pas de zéro et ne devine pas les conventions — le repo contient un report
complet qui est la **référence** à imiter. Lis ces fichiers en premier :

- `analysis/src/analysis/reports/completion_simulateurs.py` — un report : une
  fonction `get_...(date, matomo=None) -> pd.DataFrame` qui délègue les appels au
  connecteur.
- `analysis/src/analysis/commands/ingest_simulateurs.py` — sa commande : `_CREATE_TABLE`,
  `_UPSERT`, `_rows_from_df`, `ingest_day`, `INGESTER`, `main`.
- `analysis/src/analysis/commands/_runner.py` — les briques partagées : `Ingester`,
  `parse_date`, `iter_days`, `run_ingest`.
- `analysis/src/analysis/commands/ingest_all.py` — le registre `INGESTERS`.
- `analysis/src/analysis/connectors/` — `matomo_reporting.py` (API HTTP),
  `matomo.py` (`MatomoSQLConnectorSync` synchrone / `MatomoSQLConnector` async
  historique, réplique SQL), `metabase_db.py` (connecteur **générique** :
  `upsert(*, table_ddl, insert_sql, rows)`).
- `analysis/src/analysis/matomo_segments.py` — segments Matomo partagés
  (`DEVICE_SEGMENTS` : desktop / mobile = smartphone + tablette). Réutilise cette
  constante pour toute ventilation par device au lieu d'en redéfinir une locale.
- `analysis/src/analysis/config.py` — les settings (env).

Génère du code qui se lit comme celui-là : même style de docstrings (FR), mêmes
noms, `from __future__ import annotations`, ruff `line-length = 88`.

## Demande du contexte quand c'est ambigu — ne devine pas

Le calcul fourni ne suffit souvent pas à fixer le schéma. **Pose les questions
manquantes** (regroupe-les, ne noie pas l'utilisateur) avant de générer :

1. **Source des données** : API Matomo Reporting (pages vues / events par URL →
   `MatomoReportingConnector`, déjà passé à l'ingester), réplique Postgres Matomo
   (events bruts → `MatomoSQLConnectorSync`, **synchrone**), ou un calcul
   autonome ?
2. **Granularité** : une ligne par jour + quelles **dimensions** (device, titre,
   slug, idcc…) ? Le report tourne-t-il par jour (défaut, comme les autres) ?
3. **Colonnes de sortie** : pour chaque colonne, est-ce une **dimension** (fait
   partie de la clé, identifie la ligne) ou une **métrique** (valeur mesurée,
   agrégée) ? Peut-elle être **absente/NULL** (ex. un segment sans trafic) ?
4. **Liste d'entités à parcourir** : si le calcul itère sur un ensemble non
   déterminé par le calcul lui-même (slugs de contribution, URLs, pages, idcc,
   identifiants de simulateur…), **demande la liste exacte à l'utilisateur** — ne
   la déduis PAS d'une source implicite (sitemap, `fetch_generic_slugs`, scan
   d'API…). Le périmètre suivi est un **choix métier**, pas « tout le site » ;
   une source implicite crée une dépendance réseau cachée et un périmètre qui
   dérive dans le temps. Fige la liste en constante explicite dans le report (ex.
   `BASE_SLUGS`), surchargeable via un argument (ex. `base_slugs=`).
5. **Nom de la table** et **clé primaire** si non évidents.

Si l'utilisateur ne sait pas, propose un défaut raisonnable et explique-le —
**sauf** pour la liste d'entités (point 4), qu'il faut vraiment obtenir de lui.

## Étape 1 — Cadrer la forme des données de sortie

Avant d'écrire une ligne de SQL, établis le **contrat de colonnes** du DataFrame
renvoyé par le report. C'est la source de vérité pour tout le reste.

Produis une petite table mentale (ou affiche-la à l'utilisateur pour validation) :

| colonne DataFrame | rôle | type Python observé | NULL possible ? |
| ----------------- | ---- | ------------------- | --------------- |

Points d'attention :

- **La colonne `date` n'est généralement PAS dans le DataFrame** : elle est
  injectée à l'insertion depuis le jour ingéré (voir `_rows_from_df(df, date)`).
  La table cible commence donc par `date DATE NOT NULL`, suivie des colonnes du
  DataFrame.
- **Dimensions vs métriques** : les dimensions forment la clé (avec `date`), les
  métriques sont les valeurs mises à jour en cas de ré-ingestion.
- **Métriques manquantes** : si une valeur peut être absente (ex. `visites` sur un
  segment mobile vide), la colonne est **nullable** et le mapping convertit
  `NaN → None` (cf. `pd.notna(...)`).

## Étape 2 — Dériver le schéma Postgres depuis les types

Mappe chaque colonne vers un type Postgres à partir de la donnée réelle, pas d'un
a priori :

| Donnée de sortie                         | Type Postgres | Notes                       |
| ---------------------------------------- | ------------- | --------------------------- |
| texte / libellé / slug                   | `TEXT`        | dimensions catégorielles    |
| comptage entier (visites, starts, clics) | `INTEGER`     | `BIGINT` si > 2·10⁹ attendu |
| ratio / montant / valeur décimale        | `NUMERIC`     | ne pas arrondir à l'INT     |
| booléen                                  | `BOOLEAN`     |                             |
| date (jour ingéré)                       | `DATE`        | colonne `date`, injectée    |
| horodatage                               | `TIMESTAMP`   | rare ici                    |

Règles :

- **Clé primaire** = `(date, <dimensions>)`. Les colonnes de la clé sont `NOT NULL`.
- **Ne stocke pas une valeur dérivable** d'autres colonnes (ex. un taux = a/b) :
  laisse Metabase la calculer. C'est une décision explicite prise sur ce projet.
- Nom de table en `snake_case`, préfixé par le domaine (ex. `completion_simulateurs`).

Exemple de DDL attendu (à adapter aux colonnes réelles) :

```sql
CREATE TABLE IF NOT EXISTS <table> (
    date        DATE    NOT NULL,
    <dim1>      TEXT    NOT NULL,
    <dim2>      TEXT    NOT NULL,
    <metric1>   NUMERIC,
    <metric2>   INTEGER,
    PRIMARY KEY (date, <dim1>, <dim2>)
);
```

## Étape 3 — Générer l'upsert idempotent + le mapping des lignes

L'ingestion doit pouvoir **rejouer un jour sans créer de doublon** : c'est un
`INSERT ... ON CONFLICT (<clé>) DO UPDATE`. Toutes les colonnes **hors clé** sont
mises à jour depuis `EXCLUDED`.

```sql
INSERT INTO <table> (date, <dim1>, <dim2>, <metric1>, <metric2>)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (date, <dim1>, <dim2>)
DO UPDATE SET
    <metric1> = EXCLUDED.<metric1>,
    <metric2> = EXCLUDED.<metric2>;
```

Le mapping `_rows_from_df(df, date)` produit un tuple **dans l'ordre exact des
colonnes de l'INSERT**, en gérant les types et les NULL :

```python
def _rows_from_df(df: pd.DataFrame, date: str) -> list[tuple]:
    return [
        (
            date,
            row["<dim1>"],
            row["<dim2>"],
            row["<metric1>"] if pd.notna(row["<metric1>"]) else None,
            int(row["<metric2>"]),
        )
        for _, row in df.iterrows()
    ]
```

Vérifie toujours que **nombre de colonnes DDL == nombre de `%s` == longueur du
tuple**. C'est l'erreur la plus fréquente.

## Étape 4 — Écrire le report et la commande

**Report** `analysis/src/analysis/reports/<name>.py` : une fonction
`get_<name>(date: str, matomo: MatomoReportingConnector | None = None) -> pd.DataFrame`.
Reproduis le patron de `completion_simulateurs.py` (ouverture paresseuse du
connecteur si `matomo is None`, appels délégués au connecteur, DataFrame final
avec les colonnes du contrat).

- Source = **Reporting API** → utilise le `matomo` reçu (ne rouvre pas de client).
- Source = **réplique SQL** → utilise `MatomoSQLConnectorSync` (**synchrone**),
  que le report ouvre lui-même (`with MatomoSQLConnectorSync() as m:
m.run_query_df(...)`). Le report reste **synchrone** comme les autres — pas
  d'`async`/`await`, pas d'`asyncio.run` (qui casse dans Jupyter). Le
  paramètre `matomo` (client Reporting HTTP) n'est alors pas utilisé : garde-le
  dans la signature pour l'uniformité, ou ignore-le si le report est purement SQL.
  N'utilise **jamais** le `MatomoSQLConnector` async pour un nouveau report.

**Commande** `analysis/src/analysis/commands/ingest_<name>.py` : copie la structure
de `ingest_simulateurs.py` — `_CREATE_TABLE`, `_UPSERT`, `_rows_from_df`,
`ingest_day(matomo, metabase, day) -> int` (qui appelle `get_<name>` puis
`metabase.upsert(table_ddl=_CREATE_TABLE, insert_sql=_UPSERT, rows=rows)`),
`INGESTER = Ingester(name="<name>", run=ingest_day)`, et un `main()` autonome
(date explicite) via `parse_date` / `iter_days` / `run_ingest`.

## Étape 5 — Enregistrer et documenter

Trois câblages, sans lesquels le report ne tourne pas dans le job planifié :

1. **Registre** — ajoute son `INGESTER` à `INGESTERS` dans
   `analysis/src/analysis/commands/ingest_all.py` (1 import + 1 entrée). C'est ce
   qui le fait tourner dans le cron J-2.
2. **Console script** — ajoute `ingest-<name> = "analysis.commands.ingest_<name>:main"`
   dans `[project.scripts]` de `analysis/pyproject.toml`.
3. **README** — ajoute une sous-section « report » et une ligne dans la section
   « Ingest data into Metabase » de `analysis/README.md`.

## Étape 6 — Vérifier

Depuis `analysis/` :

```bash
uv sync --frozen                    # enregistre le nouveau script
uv run ruff check src/ && uv run ruff format --check src/
uv run ingest-<name> --help         # le script est résolu
uv run ingest-all --help            # le registre charge sans erreur
```

Ne t'arrête pas au smoke test en mémoire : le point le plus fragile d'un report
est le **chemin d'écriture en base** (DDL + upsert + ordre des colonnes), et il se
teste **sans credentials Matomo**. La base Metabase locale est fournie par Docker :

```bash
docker compose up -d metabase-db    # depuis la racine du repo (port hôte 5433)
```

Teste alors le chemin BDD de bout en bout **en stubant le report** (nourris
`ingest_day`/l'upsert avec un petit DataFrame factice représentatif des colonnes
de sortie, sans appeler Matomo), puis vérifie l'**idempotence** : exécute l'upsert
**deux fois** sur la même date et confirme via un `SELECT count(*)` que le nombre
de lignes ne double pas (c'est tout l'intérêt du `ON CONFLICT`). Nettoie derrière
toi (`DROP TABLE`).

Si en plus des identifiants Matomo sont disponibles, fais un vrai run complet sur
une journée connue. Le plus proche de la prod : le service Compose `analysis`
(image du CronJob nocturne), qui démarre `metabase-db` et écrit dedans —

```bash
# depuis la racine du repo (requiert analysis/.env : credentials Matomo)
docker compose run --rm analysis ingest-<name> 2026-06-01   # un ingester, une date
docker compose run --rm analysis                            # ingest-all, J-2 (le cron)
```

Sinon, indique clairement à l'utilisateur que seul le run Matomo réel reste à
faire — mais le schéma et l'idempotence, eux, doivent être vérifiés contre la
vraie base locale, pas seulement en mémoire.

## Checklist finale

- [ ] Contrat de colonnes établi (dimensions vs métriques, nullabilité) et validé
- [ ] DDL : types corrects, `NOT NULL` sur la clé, PK = `(date, <dimensions>)`
- [ ] Pas de valeur dérivable stockée (taux, %) sauf demande explicite
- [ ] `#colonnes DDL == #%s == len(tuple)` ; `NaN → None` sur les métriques nullables
- [ ] Report + commande créés, style aligné sur l'exemple
- [ ] `ingest_all.INGESTERS` + `pyproject [project.scripts]` + README à jour
- [ ] ruff clean ; `ingest-<name> --help` et `ingest-all --help` OK
- [ ] Chemin BDD testé contre le `metabase-db` local (schéma créé + upsert rejoué
      deux fois sans doublon), même sans credentials Matomo
