# AGENTS.md

Consignes pour les agents de code (et les humains) qui travaillent sur ce dépôt.

## Projet

Back-office (admin) du Code du travail numérique (CDTN). Monorepo pnpm + Lerna :

| Dossier                        | Rôle                                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targets/frontend`             | Admin Next.js 16 (Pages Router), React 19, MUI + DSFR, urql/GraphQL, next-auth, Tiptap. Code par domaine dans `src/modules/<domaine>/{api,components,__tests__}`. |
| `targets/hasura`               | Hasura v2 : migrations SQL + metadata.                                                                                                                            |
| `targets/ingester`             | CLI d'import des sources externes (legi, kali, fiches) dans Hasura.                                                                                               |
| `targets/alert-cli`            | Détection des différences entre versions des données sources, insérées comme alertes.                                                                             |
| `targets/export-elasticsearch` | API Express d'export Postgres → Elasticsearch (port 8787).                                                                                                        |
| `shared/*`                     | `types`, `utils`, `elasticsearch`, `eslint-config`.                                                                                                               |
| `analysis/`                    | Python 3.13 + uv, **hors workspace pnpm** : agrégats Matomo → Postgres Metabase, notebooks. Voir [`analysis/README.md`](analysis/README.md).                      |

## Démarrer

- Node : version de `.node-version` (24.22.1). pnpm : version de `packageManager` (10.30.0).
- Setup (cf. [README](README.md#setup)) : token Tiptap Pro dans `.npmTiptapToken.secret` (chargé par direnv via `.envrc`), `cp .env.example .env`, puis `pnpm install && pnpm build`.
- Lancer :

```sh
docker compose up hasura      # Postgres + Hasura (localhost:8080)
pnpm --filter=frontend dev    # http://localhost:3001
```

- Connexion locale : `codedutravailnumerique@travail.gouv.fr` / `admin`.

## Vérifier avant de rendre la main

Lancer les checks concernés par le changement **avant** de déclarer le travail terminé. Mêmes checks que la CI (`.github/workflows/quality.yml`) :

```sh
pnpm build
pnpm lint
pnpm type-check
pnpm test
pnpm format:check            # pnpm format pour corriger
pnpm --filter=<pkg> test     # un seul package (frontend, ingester, @shared/utils…)
```

Dans `analysis/` (CI : `.github/workflows/python-analysis.yml`, ruff uniquement) :

```sh
uv sync
uv run ruff check .
uv run ruff format --check .
uv run pytest                # pas lancé en CI : à faire en local
```

## Conventions

- Formatage Prettier (`.prettierrc`) : 80 colonnes, 2 espaces, guillemets doubles, point-virgule, `trailingComma: "es5"`.
- Textes d'interface en français, **sans i18n** : chaînes en dur dans les composants.
- Nouveaux noms de tests en français (`it("crée un nouveau document si pas de doc")`).
- Tests Jest dans `__tests__/` à côté du code (`export-elasticsearch` utilise aussi `__test__/` et des `*.test.ts` colocalisés).
- Tests Python (pytest) dans `analysis/tests/` (et `analysis/src/analysis/l2/tests/` pour le pipeline L2).

## Base de données (Hasura)

- Nouvelle migration : `targets/hasura/migrations/default/<timestamp>_<nom>/{up,down}.sql`.
- **Ne jamais modifier une migration existante** : en ajouter une nouvelle.
- Toute nouvelle table : ajouter dans la migration l'appel d'audit `select audit.audit_table('<table>');` (cf. section « Auditabilité » du README).
- Metadata dans `targets/hasura/metadata/`. Migrations et metadata sont appliquées au démarrage de l'image `cli-migrations` de Hasura.

## Git & PR

- Commits conventionnels `type(scope): description` : type et scope en anglais, description en français. Ex. `feat(analysis): ajout de la retention brut-net`.
- **Titres et descriptions de PR en français.**
- Branches `issue-<numéro>-<slug>`. Une branche préfixée `linked` (`linked-ma-feature`) partage l'index Elasticsearch avec la branche homonyme du repo frontend CDTN (cf. README).
- Chaque branche poussée déploie un environnement de review (`review-auto.yaml`).
- Le hook husky `pre-commit` retire les sorties des notebooks. Ne pas commiter `analysis/output/` ni les dumps du pipeline L2 (`analysis/notebooks/l2/*.{csv,xlsx,json}`).

## Interdits / prudence

- Ne jamais lire ni commiter `.env*`, `.npmTiptapToken.secret`, `.npmrc`, `local_dump/`.
- Scripts qui touchent la prod via le contexte `kubectl` courant : `scripts/dump_db.sh`, `scripts/dump_db_at.sh`, `scripts/connect_db.sh` (`-w` = écriture sur le primaire). **Ne pas les lancer sans demande explicite.**
- `scripts/reset_from_dump.sh` supprime les volumes Docker locaux (`docker compose down --volumes`).
- Le serveur MCP `metabase` pointe sur la prod avec les outils d'écriture (`TOOL_MODE: all`) : toute écriture modifie les dashboards réels.
- Pas de tag `v*`, ni de `lerna version`, ni de lancement du workflow `release.yml` : cela déclenche le déploiement en production.
- `.github/workflows/` et `CODEOWNERS` appartiennent à `@socialgouv/sre` : ne pas les modifier sans leur accord.

## Skills

| Skill                   | Quand l'utiliser                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `add-metabase-analysis` | Point d'entrée de **toute** demande d'analyse du PO (chiffre, taux, graphique, KPI, carte Metabase, « a-t-on la donnée ? »). Cherche la donnée agrégée, sinon notebook ou fiche de besoin. |
| `add-analysis-report`   | Côté dev : transformer un calcul Python en report `analysis/` + commande d'ingestion vers Metabase (table, upsert, `ingest-all`, README).                                                  |

Ajouter un skill : créer `.agents/skills/<nom>/SKILL.md` (frontmatter `name` + `description`), puis le rendre visible à Claude Code :

```sh
ln -s ../../.agents/skills/<nom> .claude/skills/<nom>
```

## Serveurs MCP

`.mcp.json` déclare les serveurs `matomo` et `metabase`, lancés par `scripts/mcp/matomo.sh` et `scripts/mcp/metabase.sh`. Mise en place, secrets et droits : section « Serveurs MCP (Claude Code) » de [`analysis/README.md`](analysis/README.md#serveurs-mcp-claude-code).
