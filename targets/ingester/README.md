# Ingester

Service d'ingestion des données du Code du travail numérique. Il télécharge les
différents jeux de données sources, les transforme au format `documents` et les
insère dans la base via l'API GraphQL de Hasura.

Le point d'entrée est [`src/cli.ts`](src/cli.ts) (`main()`), qui traite
successivement :

- les packages npm versionnés (`@socialgouv/legi-data`, `fiches-vdd`,
  `fiches-travail-data`, `kali-data`) — téléchargés, comparés à la dernière
  version ingérée puis insérés dans la table `documents` ;
- les **accords d'entreprise** (open data ACCO), via `updateAccords()` appelé en
  fin de `main()` (voir plus bas).

## Commandes

```bash
pnpm build          # bundle src/cli.ts -> dist/ (ncc)
pnpm cli:dev        # exécute l'ingestion complète en local (Hasura localhost:8080)
pnpm test           # tests unitaires (jest)
pnpm type-check     # tsc --noEmit
pnpm lint           # eslint
```

Les commandes `cli:*` supposent un Hasura joignable sur
`http://localhost:8080/v1/graphql` avec le secret admin `admin1` (voir la stack
docker du dépôt).

## Ingestion des accords d'entreprise (open data ACCO)

Restaure la recherche d'accords d'entreprise en s'appuyant sur l'open data ACCO
publié par la DILA (l'API DILA historique étant indisponible). Tout le code est
dans [`src/accords/`](src/accords/) et l'orchestration est déclenchée par
`updateAccords()`.

### Source des données

Les archives sont listées sur l'index Apache de la DILA :
`https://echanges.dila.gouv.fr/OPENDATA/ACCO/` (référencé par la resource
« Base ACCO » du dataset data.gouv.fr `acco-accords-dentreprise`).

Deux natures d'archives `.tar.gz` :

- `Freemium_acco_global_<horodatage>.tar.gz` — **base complète** historique
  (~45 Go), type `full` ；
- `ACCO_<YYYYMMDD-HHMMSS>.tar.gz` — **incréments** publiés régulièrement, type
  `incremental`.

Structure interne d'une archive : un dossier racine horodaté (ex.
`20260424-063142/`), puis :

- `acco/global/ACCO/TEXT/…` — fichiers XML des accords, **nichés sous des
  sous-dossiers shardés** (ex. `TEXT/00/00/53/93/56/ACCOTEXT000053935667.xml`) ;
- `acco/global/bureautique/…` — documents Word/PDF, **hors périmètre** ;
- `liste_suppression_acco.dat` (à la racine horodatée) — accords à supprimer.

### Pipeline

| Étape           | Module                                                               | Rôle                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lister          | [`fetchAccoArchives.ts`](src/accords/fetchAccoArchives.ts)           | Parse l'index DILA → liste des archives (`name`, `url`, `date`, `type`)                                                                                             |
| Sélectionner    | [`selectArchivesToIngest.ts`](src/accords/selectArchivesToIngest.ts) | Écarte les archives déjà ingérées ; ordonne `full` d'abord puis par date croissante                                                                                 |
| Extraire        | [`extractAccoArchive.ts`](src/accords/extractAccoArchive.ts)         | Télécharge + décompresse en streaming ; le filtre `ignore` de tar-fs n'écrit sur disque **que** les XML d'accords et la liste de suppression (`bureautique` ignoré) |
| Parser          | [`parseAccordXml.ts`](src/accords/parseAccordXml.ts)                 | XML → `Accord` (champs RG3) via `fast-xml-parser`                                                                                                                   |
| Lire le dossier | [`readAccordsFromDir.ts`](src/accords/readAccordsFromDir.ts)         | Walk récursif + parse, tolérant aux XML invalides (compteur `errors`)                                                                                               |
| Suppressions    | [`suppressions.ts`](src/accords/suppressions.ts)                     | Parse `liste_suppression_acco.dat` → IDs à supprimer                                                                                                                |
| Persister       | [`db.ts`](src/accords/db.ts)                                         | `upsertAccords`, `deleteAccords`, `markArchiveIngested`, `getIngestedArchiveNames`                                                                                  |
| Orchestrer      | [`index.ts`](src/accords/index.ts)                                   | `updateAccords()` (toutes les nouvelles archives) et `ingestArchive()` (une archive)                                                                                |

Pour chaque archive : téléchargement → extraction → parsing → **upsert** des
accords (par lots de 500) → **suppression** des accords listés → marquage de
l'archive comme ingérée.

### Champs extraits (RG3)

`id` (identifiant DILA `ACCOTEXT…`, clé primaire), `title` (`TITRE_TXT`),
`siret`, `dateMaj`, `dateDepot`, `dateEffet`, `dateFin`, `dateDiffusion`,
`conformeVersionIntegrale`, `themes` (libellés), `signataires`.

### Suppressions

Une archive peut ne contenir **que** des suppressions (ex.
`ACCO_20260206-180417.tar.gz`). Dans `liste_suppression_acco.dat`, chaque accord
retiré apparaît sur deux lignes :

```
acco/global/ACCO/TEXT/00/00/53/43/10/ACCOTEXT000053431098   ← l'ID (basename)
acco/global/bureautique//2025/12/22/T02826061367-….docx     ← ignorée
```

On ne retient que le basename des lignes situées sous `ACCO/TEXT/`, qui
correspond à l'`id` de l'accord, puis on supprime ces accords en base.

### Schéma en base (Hasura)

Schéma PostgreSQL `accords` (migrations
[`1783598367000_create_schema_accords`](../hasura/migrations/default/1783598367000_create_schema_accords)
et
[`1783598367001_create_tables_accords`](../hasura/migrations/default/1783598367001_create_tables_accords)) :

- `accords.accords` — métadonnées des accords. Clé primaire = `id` DILA
  (upsert : une republication met à jour la ligne). Index sur `siret`
  (recherche) et `date_fin` (filtre des accords actifs).
- `accords.ingested_archives` — suivi d'ingestion : une ligne par archive déjà
  traitée, pour ne réingérer que les nouvelles.

Les deux tables sont trackées dans la metadata Hasura. L'ingester écrit via le
rôle admin (secret), qui bypass les permissions.

### Exécuter / tester en local

Ingérer **une seule archive** (utile pour valider le pipeline sans lancer la reprise complète) :

```bash
pnpm cli:accords:one                                              # petite archive incrémentale par défaut
ACCO_ARCHIVE=ACCO_20260206-180417.tar.gz pnpm cli:accords:one     # archive de suppression
ACCO_ARCHIVE=Freemium_acco_global_20250713-140000.tar.gz pnpm cli:accords:one  # base complète (45 Go)
```

Voir [`dev-ingest-one.ts`](src/accords/dev-ingest-one.ts).

### Points d'attention

- **Reprise Freemium (45 Go)** : `readAccordsFromDir` charge tous les accords
  d'une archive en mémoire. C'est sans conséquence pour les incréments, mais la
  base complète nécessite une machine disposant de suffisamment de RAM pour la
  première reprise. À défaut, refactorer en lecture _streaming_ (générateur +
  upsert au fil de l'eau).
- **Espace disque** : pendant un run, les XML extraits sont écrits sous
  `data/accords/<archive>/` puis nettoyés en fin de traitement.
