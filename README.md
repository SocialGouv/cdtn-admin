# Code du travail numérique - Outil d'administration

## Setup

Pour initialiser le projet, nous avons besoin d'une dépendance depuis le registry privé de [tiptap](https://tiptap.dev/). Suivez les étapes suivantes :

- [Créer un compte (gratuit)](https://tiptap.dev/register) sur tiptap.
- Se rendre sur la page [Pro Extensions](https://collab.tiptap.dev/pro-extensions) de votre compte pour récupérer le token
- Créer un fichier `.npmTiptapToken.secret` contenant le token. Il sera utile pour `docker compose` et pour direnv (si l'on souhaite automatiser le chargement de la variable `NPM_TIPTAP_TOKEN`)
- Exporter la variable `NPM_TIPTAP_TOKEN` dans votre shell courant ou, pour automatiser cette étape, passer à l'étape suivante
- (optionnel) Pour automatiser la chargement de cette variable lorsque l'on est dans le dossier du projet, il est possible d'installer [direnv](https://direnv.net/).

```sh
  curl -sfL https://direnv.net/install.sh | bash
```

Le fichier `.npmTiptapToken.secret` contenant le token sera chargé par le fichier .envrc déjà présent à la racine.
Il faut ensuite executer `direnv allow` (et il faudra exécuter cette commande après chaque changement du fichier .envrc pour autoriser direnv à charger son contenu automatiquement lorsque le shell est dans le dossier)

Vous pouvez maintenant lancer la commande `yarn install` pour installer les packages du projet et `yarn build` pour build les packages.

## URLs

| Environnement                                      | URL                                                       |
| -------------------------------------------------- | --------------------------------------------------------- |
| Production (access granted only for authorized IP) | <https://cdtn-admin.fabrique.social.gouv.fr/>             |
| Preproduction                                      | <https://cdtn-admin-preprod.ovh.fabrique.social.gouv.fr/> |

## Projets

### ingester

Used to populate the database with documents provided by external sources.

- [@SocialGouv/fiches-travail-data](https://github.com/SocialGouv/fiches-travail-data)
- [@SocialGouv/fiches-vdd](https://github.com/SocialGouv/fiches-vdd)
- [@SocialGouv/kali-data](https://github.com/SocialGouv/kali-data)
- [@SocialGouv/legi-data](https://github.com/SocialGouv/legi-data)

Each GitHub repo uses releases to track changes. Each release exposes content as JSON. Ingester retrieves the last
version and inject data into Hasura.

A part of the content is based on documents retrieved from another services (code du travail, contributions, fiche
travail/emploi...).

This step runs the Ingester script and populate the documentation.

> Run the Ingester (/!\ hasura must be started):
>
> ```sh
> yarn workspace ingester run cli:dev
> ```

### alert-cli

Used to detect changes between external source packages. For each new release of an external packages, this script
compares the content and insert diff in the database.

### hasura

To access to the Hasura console, run this command:

```sh
hasura console --envfile ../../.env --project targets/hasura
```

A webpage is opened in your browser. The password is `admin1` as set in the `.env` file (`HASURA_GRAPHQL_ADMIN_SECRET`
key).

> Start only the Hasura instance (it starts the postgreSQL as dependency):
>
> ```sh
> docker compose up hasura
> ```

### frontend

An administration website is available to configure and inject custom data.

This step starts the frontend project (based on `next.js`). User and admin accounts are automatically created by the
Hasura step.

Frontend is reachable at the address <http://localhost:3001>

> Run the frontend (it starts Hasura as dependency):
>
> ```sh
> yarn workspace frontend dev
> ```

## export-elasticsearch

This service exposes an API which handle to trigger the export of the data from Postgres to Elasticsearch.

### Running an export

#### 1. Install and build dependencies

At the root of the project

```sh
yarn # to install dep
yarn workspace export-elasticsearch build # to build project
```

#### 2. Load data from production to local

At the root of the project, please run this command:

```sh
docker compose up -d postgres
./scripts/dump_db.sh -n cdtn-admin
```

#### 3. Run ingester in development mode

```sh
DISABLE_LIMIT_EXPORT=true DISABLE_AGREEMENTS=true DISABLE_SITEMAP=true DISABLE_COPY=true HASURA_GRAPHQL_ENDPOINT="http://localhost:8080/v1/graphql" HASURA_GRAPHQL_ADMIN_SECRET="admin1" ELASTICSEARCH_URL_PREPROD="http://localhost:9200" ELASTICSEARCH_URL_PROD="http://localhost:9200" SITEMAP_DESTINATION_FOLDER="sitemap" SITEMAP_NAME="sitemap.xml" SITEMAP_ENDPOINT="http://localhost:3001/api/sitemap" AGREEMENTS_DESTINATION_FOLDER="agreements" AGREEMENTS_DESTINATION_NAME="index.json" BUCKET_DEFAULT_FOLDER="default" BUCKET_DRAFT_FOLDER="draft" BUCKET_PUBLISHED_FOLDER= BUCKET_PREVIEW_FOLDER="preview" BUCKET_ACCESS_KEY="MINIO_ACCESS_KEY" BUCKET_ENDPOINT=http://localhost:9000 BUCKET_NAME="cdtn" BUCKET_SECRET_KEY="MINIO_SECRET_KEY" BUCKET_REGION="us-east-1" CDTN_ADMIN_ENDPOINT="http://localhost:8080/v1/graphql" ELASTICSEARCH_INDEX_PREPROD="cdtn-v2" ELASTICSEARCH_INDEX_PROD="cdtn-v2" FETCH_PAGE_SIZE=1000 FETCH_JOB_CONCURRENCY=5 yarn workspace export-elasticsearch dev
```

- `DISABLE_LIMIT_EXPORT` is used to disable the limit to run two export in less than one hour
- `DISABLE_INGESTER` is used to disable the copy from postgres to elasticsearch
- `DISABLE_COPY` is used to disable copy between two containers
- `DISABLE_SITEMAP` is used to disable copy of the sitemap
- `DISABLE_AGREEMENTS` is used to disable copy of the agreements

#### 4. Run the export elasticsearch

##### With cli

```sh
yarn workspace export-elasticsearch run:ingester
```

##### On admin

```sh
yarn workspace frontend dev
```

#### On client

```sh
yarn workspace @cdt/frontend dev
```

1. Go to `http://localhost:3001/`
2. Connect to the frontend ui with `codedutravailnumerique@travail.gouv.fr` and `admin` as password.
3. Navigate to `Mise à jour`
4. Click on `Mettre à jour la pre-production` or `Mettre à jour la production`

## Données

### Table public.documents

La table documents dans le schéma public contient les documents qui se transforment (pour la plus grande partie) en page sur le site du code du travail numérique.

Voici un tableau descriptif des champs de cette table :

| Nom du champ     | type                     | Description                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cdtn_id          | text                     | Identifiant unique générer par la méthode `generateIds` dans le package `shared/utils` ou via l'API `/api/id?source=XXX` où XXX est la source                                                                                                                                                                                                             |
| initial_id       | text                     | L'identifiant externe du document (pour les contenus legifrance c'est le `KALIARTI` renvoyé par l'API, pour la fiche service publique c'est l'identifiant `FXXX` fourni, pour les contenus internes c'est un UUID généré, cf API pour le cdtn_id)                                                                                                         |
| title            | text                     | Le titre de la page qui sera affiché dans le H1. Attention, il y a également le `meta_title` qui peut être présent dans le champ `document`                                                                                                                                                                                                               |
| meta_description | text                     | La meta description de la page                                                                                                                                                                                                                                                                                                                            |
| source           | text                     | L'identifiant de la source, voici la liste: (`dossiers`, `prequalified`, `conventions_collectives`, `external`, `themes`, `contributions`, `page_fiche_ministere_travail`, `information`, `outils`, `highlights`, `modeles_de_courriers`, `fiches_service_public`, `code_du_travail`)                                                                     |
| slug             | text                     | Le slug présent dans l'URL utilisé comme identifiant unique pour récupérer le contenu dans la page depuis le front                                                                                                                                                                                                                                        |
| text             | text                     | Contenu de la page en format texte brut pour générer les vecteurs de recherche                                                                                                                                                                                                                                                                            |
| document         | jsonb                    | Contenu de la page dans un format `jsonb` (attention, ça peut être un peu un fourre-tout)                                                                                                                                                                                                                                                                 |
| is_published     | boolean                  | Permet d'activer/désactiver la génération d'une page sur le site associé au contenu. Utilisé pour dépublier du contenu par l'équipe métier. Attention, actuellement utilisé également pour permettre la recherche de convention collective qui ne possèdent pas de page associée issue du projet `kali-data`                                              |
| is_searchable    | boolean                  | Permet de recherche la page depuis le moteur globale du site code du travail numérique. Cela ne permet pas de désactiver la recherche depuis un moteur externe.                                                                                                                                                                                           |
| created_at       | timestamp with time zone | Date de création du document                                                                                                                                                                                                                                                                                                                              |
| updated_at       | timestamp with time zone | Date de mise à jour du document                                                                                                                                                                                                                                                                                                                           |
| is_available     | boolean                  | **Flag technique**. Il est utilisé par l'ingester. Il permet d'identifier les contenus externes (fiche SP, convention collective...) qui ne sont plus disponibles. L'ingester va mettre le flag à false dans ce cas. On ne supprime pas le contenu car il y a des thèmes associés et si le contenu revient, on ne souhaite pas perdre les thèmes associés |

## Auditabilité

Lorsqu'on rajoute une table, ne pas oublier de rajouter dans la migration l'appel à la fonction d'audit

```sql

-- ajout des triggers d'audit sur la table documents
select audit.audit_table('documents');

-- Le trigger peut être configuré pour
select audit.audit_table('documents',
-- se declencher au niveau ROW ou STATEMENT
                         'false',
-- enregistrer le text de la requête
                         'false',
-- ignorer d'enregistrer certains champs
                         '{text}');
```

Pour voir la [configuration du trigger](targets/hasura/migrations/1613474820206_audit_trigger/up.sql)

## Suppression des données anciennes

Les données de certaines tables sont nettoyées automatiquement.

Pour l'instant seulement 2 triggers sont en place:

- nettoyage de la table `alerts` (alertes traitées conservés pour 3mois)
- nettoyage de la table `audit.logged_action` (actions conservées pour 3mois)

## Requêtes hasura utiles

### Compter le nombre de documents totaux

```gql
query GetAllDocuments($sources: [String!]) {
  documents(where: { source: { _in: $sources } }) {
    cdtn_id
  }
}
```

With published documents:

```gql
query GetAllDocumentsPublished($sources: [String!]) {
  documents(where: { is_published: { _eq: true }, source: { _in: $sources } }) {
    cdtn_id
  }
}
```

Avec comme paramètres :

```json
{
  "sources": [
    "page_fiche_ministere_travail",
    "information",
    "fiches_service_public",
    "modeles_de_courriers",
    "contributions",
    "conventions_collectives"
  ]
}
```

Pour la partie sql, il faut utiliser la requête suivante :

```sql
SELECT COUNT(*)
FROM documents
WHERE source IN ('page_fiche_ministere_travail', 'information', 'fiches_service_public', 'modeles_de_courriers', 'contributions', 'conventions_collectives')
  AND is_published = TRUE;
```

## Lier une branche de test de l'admin à une branche du frontend CDTN fonctionnelle

Le but est de pouvoir exporter les données de la branche dans elasticsearch et d'avoir une instance du site cdtn qui est lié à ces données.

### Bien nommer sa branche

Afin de lier les deux environnements, il est nécessaire de nommer identiquement ses branches (admin et cdtn) en commençant par le mot `linked` (exemple : `linked-my-feature`, `linked/my-feature`).
Cela permet de lier l'index elasticsearch automatiquement entre les deux branches.

### Exporter les données sur une branche déployée

L'export des données se fait depuis l'admin dans la section `Contenus > Mise à jour`. Il faut ensuite cliquer sur le bouton `Mettre à jour la pre-production`.

### Limitations connues

- Les fichiers du site sont stockés au même endroit pour l'ensemble des branches. Si on ajoute/modifie/supprime un fichier, cela sera également le cas sur l'ensemble des branches
- Le sitemap du site est stocké au même endroit pour l'ensemble des branches. Les branches sur le site CDTN récupérera le dernier sitemap généré.
