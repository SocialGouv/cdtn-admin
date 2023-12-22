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
| Preproduction                                      | <https://preprod-cdtn-admin.dev.fabrique.social.gouv.fr/> |

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

| Type  | Username                               | Password |
| ----- | -------------------------------------- | -------- |
| Admin | codedutravailnumerique@travail.gouv.fr | admin    |
| User  | utilisateur@travail.gouv.fr            | user     |

Frontend is reachable at the address <http://localhost:3001>

> Run the frontend (it starts Hasura as dependency):
>
> ```sh
> docker compose up www
> ```
>
> or via npm
>
> ```sh
> yarn workspace frontend dev
> ```

That's all 🎉

## export-elasticsearch

This service exposes an API which handle to trigger the export of the data from Postgres to Elasticsearch. Then, copy sitemap.xml from a container azure to an other container azure. To finish, it copies a container azure to an other container azure.

### Environment variable

| Name                   | Description                                                                                     | Default value |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------- |
| `DISABLE_LIMIT_EXPORT` | It allows you to disable concurrent run in ingester (by default it's one hour between each run) | undefined     |
| `DISABLE_INGESTER`     | It allows you to disable ingester in the process of export                                      | undefined     |
| `DISABLE_SITEMAP`      | It allows you to disable copy of the sitemap                                                    | undefined     |
| `DISABLE_COPY`         | It allows you to disable copy between two containers                                            | undefined     |
| `DISABLE_GLOSSARY`     | It allows you to disable the glossary (inject tooltips in contents)                             | undefined     |

### Running an export

#### 1. Install and build dependencies

At the root of the project

```sh
yarn # to install dep
yarn build # to build project
```

#### 2. Run the postgres to add data

At the root of the project, please run this command:

```sh
docker-compose up -d postgres
```

#### 3. Load data from production to local

##### 1. Restore data

```sh
docker-compose exec -T postgres pg_restore \
  --dbname postgres --clean --if-exists --user postgres \
  --no-owner --no-acl --verbose  < ~/MY_PATH/hasura_prod_db.psql
```

##### 2. Restore roles

```sh
docker-compose exec -T postgres psql \
  --dbname postgres --user postgres \
  < .kontinuous/sql/post-restore.sql
```

#### 4. Run the other containers

```sh
docker-compose up -d hasura azurite elasticsearch
```

#### 5. Run ingester in development mode

```sh
GLOSSARY_PREPROD_DISABLE=true DISABLE_LIMIT_EXPORT=true DISABLE_SITEMAP=true DISABLE_COPY=true NLP_URL=https://serving-ml-preprod.dev.fabrique.social.gouv.fr HASURA_GRAPHQL_ENDPOINT="http://localhost:8080/v1/graphql" HASURA_GRAPHQL_ADMIN_SECRET="admin1" ELASTICSEARCH_URL_PREPROD="http://localhost:9200" ELASTICSEARCH_URL_PROD="http://localhost:9200" AZ_ACCOUNT_KEY_FROM="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==" AZ_ACCOUNT_NAME_FROM="devstoreaccount1" AZ_URL_FROM="http://localhost:10000/devstoreaccount1" AZ_ACCOUNT_KEY_TO="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==" AZ_ACCOUNT_NAME_TO="devstoreaccount1" AZ_URL_TO="http://localhost:10000/devstoreaccount1" SITEMAP_DESTINATION_CONTAINER="sitemap" SITEMAP_DESTINATION_NAME="sitemap.xml" SITEMAP_ENDPOINT="http://localhost:3001/api/sitemap" CDTN_ADMIN_ENDPOINT="http://localhost:8080/v1/graphql" SOURCE_CONTAINER_COPY="sitemap" DESTINATION_CONTAINER_COPY="testcopy" ELASTICSEARCH_INDEX_PREPROD="cdtn-v2" ELASTICSEARCH_INDEX_PROD="cdtn-v2" yarn workspace export-elasticsearch dev
```

- `DISABLE_LIMIT_EXPORT` is used to disable the limit to run two export in less than one hour
- `DISABLE_COPY` is used to disable copy between two containers
- `DISABLE_SITEMAP` is used to disable copy of the sitemap
- `GLOSSARY_PREPROD_DISABLE` is used to disable glossary to gain time.

> **Note**: You can remove `NLP_URL` from your environment variables if you don't want to use the NLP service and gain time during the process of ingester elasticsearch.

#### 6. Run the export elasticsearch

##### With cli

```sh
yarn workspace export-elasticsearch run:ingester
```

##### With frontend ui

```sh
yarn workspace frontend dev
```

1. Go to `http://localhost:3001/`
2. Connect to the frontend ui with `codedutravailnumerique@travail.gouv.fr` and `admin` as password.
3. Navigate to `Mise à jour`
4. Click on `Mettre à jour la pre-production` or `Mettre à jour la production`

### Générer un backup en local

1. Se connecter à teleport : `tsh login --proxy=teleport.fabrique.social.gouv.fr --auth=github`
2. Lancer la commande pour faire un proxy avec la database de prod : `tsh proxy db --db-user=PostgresAdmins --db-name=postgres cdtnadminprodserver --tunnel`
3. Utiliser pg_dump pour faire un backup de la database en remplaçant par le bon port : `docker-compose exec -T postgres pg_dump --no-owner --no-acl -v -Fc postgres://PostgresAdmins@host.docker.internal:PORT/hasura_prod > hasura_cdtn_admin_prod_db.psql`

La documentation pour teleport est disponible ici : <https://socialgouv.github.io/support/docs/faq#alternative-via-le-cli-teleport-tsh>

## Données

### Table public.documents

La table documents dans le schéma public contient les documents qui se transforment (pour la plus grande partie) en page sur le site du code du travail numérique.

Voici un tableau descriptif des champs de cette table :

| Nom du champ     | type                     | Description                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cdtn_id          | text                     | Identifiant unique générer par la méthode `generateCdtnId` dans le package `shared/id-generator`                                                                                                                                                                                                                                                          |
| initial_id       | text                     | L'identifiant externe du document (pour les contenus legifrance c'est le `KALIARTI` renvoyé par l'API, pour la fiche service publique c'est l'identifiant `FXXX` fourni, pour les contenus internes c'est un UUID généré...)                                                                                                                              |
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

## How to ?

### Injecter les données depuis la production

Actuellement, l'ingester permet d'alimenter la base de données avec les documents externes (contributions, code du
travail...). Toutes les données écrites par l'équipe (thèmes, dossiers, modèles...) doivent, par contre, être récupéré
depuis la base de données en production.

Une [issue](https://github.com/SocialGouv/cdtn-admin/issues/320) a été ouverte pour trouver la meilleure façon de
récupérer les données de production dans un environnement de dev. Actuellement, la meilleure solution est de demander un
backup de la base de données à l'équipe SRE et d'exécuter les commandes suivantes :

```sh
docker compose exec -T postgres pg_restore \
  --dbname postgres --clean --if-exists --user postgres \
  --no-owner --no-acl --verbose  < ~/Downloads/hasura_prod_db.psql
```

et pour remettre les utilisateurs par défaut

```sh
docker compose exec -T postgres psql \
  --dbname postgres --user postgres \
  < .kontinuous/sql/post-restore.sql
```

### Alimenter l'elasticsearch en local (pour le CDTN frontend)

Dans un premier temps, il faut lancer un elasticsearch. Il faut ensuite lancer l'`export-elasticsearch` pour alimenter l'elasticsearch. Ce dernier récupérant les données
depuis hasura, il est préférable de récupérer les données de prod.

Par défaut, la commande va alimenter l'elasticsearch en local sur le port 9200 qui est le port utilisé par
l'elasticsearch du projet [code-du-travail-numerique](https://github.com/SocialGouv/code-du-travail-numerique).

Ce script utilise les variables suivantes :

| Variable                    | Description                                                                                                          | Par défaut                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| CDTN_ADMIN_ENDPOINT         | URL vers l'endpoint de l'admin (ou d'hasura)                                                                         | http://localhost:8080/v1/graphql                                                       |
| HASURA_GRAPHQL_ENDPOINT     | URL vers l'endpoint GraphQL d'Hasura                                                                                 | http://localhost:8082/v1/graphql                                                       |
| HASURA_GRAPHQL_ADMIN_SECRET | L'admin secret pour se connected à Hasura                                                                            | admin1                                                                                 |
| HASURA_GRAPHQL_JWT_SECRET   | Le JWT secret pour se connected à Hasura                                                                             | `{"type": "HS256", "key": "a_pretty_long_secret_key_that_should_be_at_least_32_char"}` |
| NLP_URL                     | URL vers le [serving-ml](https://github.com/SocialGouv/serving-ml) permettant de vectoriser les documents            | vide                                                                                   |
| ES_LOGS                     | URL ver le [monolog](https://github.com/SocialGouv/cdtn-monolog) permettant de récupérer les covisites sur les pages | vide                                                                                   |
| ES_LOGS_TOKEN               | Token pour se connecter au monolog                                                                                   | vide                                                                                   |

Certaines variables permettent d'activer une fonctionnalité :

- `NLP_URL` permet d'activer la vectorisation des documents pour la recherche. Pour l'activer, vous pouvez utiliser l'URL <https://serving-ml-preprod.dev.fabrique.social.gouv.fr>.
- `ES_LOGS` et `ES_LOGS_TOKEN` permettent d'activer les `Articles liés`. Pour l'activer, vous pouvez récupérer ces informations depuis Rancher.

#### Tester localement l'ingester ES avec le frontend

```sh
yarn build # build code
```

Then, follow instruction in the README.md of `export-elasticsearch`.

On the client, you need to run this command :

```sh
NLP_URL=https://serving-ml-preprod.dev.fabrique.social.gouv.fr yarn dev:api # côté cdtn-frontend
API_URL=http://localhost:1337/api/v1 yarn workspace @cdt/frontend dev # côté cdtn-frontend
```

## Troubleshooting

## Compter le nombre de documents totaux

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
  "sources": ["page_fiche_ministere_travail", "information", "fiches_service_public", "modeles_de_courriers", "contributions", "conventions_collectives"]
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

> Note: Le glossary (injection des tooltips) et le NLP (vectorisation des données) sont par défaut désactivé en dev.

#### Activer le glossary et le NLP

Il faut commencer par donner les ressources nécessaires au processus dans l'environnement de dev :

- Ouvrir le fichier `.kontinous/env/dev/values.yaml`
- Appliquer ce que les commentaires indiquent pour les ressources sur hasura et export

L'export des données se fait depuis l'admin dans la section `Contenus > Mise à jour`. Il faut ensuite cliquer sur le bouton `Mettre à jour la production`.

<strong>/!\ /!\ /!\ ATTENTION /!\ /!\ /!\ : Bien penser à remettre les lignes en commentaire avant de merger dans master !</strong>

> Pourquoi changer les ressources ?
> L'export avec glossary et NLP est un processus qui demande beaucoup de RAM/CPU. Afin de ne pas surcharger le cluster de dev, on ne va pas demander ces ressources car l'export est peu utilisé pour les tests. Il n'existe aucun mécanisme sur la CI à l'heure actuelle pour permettre de faire le switch autrement.

### Limitations connues

- Les fichiers du site sont stockés au même endroit pour l'ensemble des branches. Si on ajoute/modifie/supprime un fichier, cela sera également le cas sur l'ensemble des branches
- Le sitemap du site est stocké au même endroit pour l'ensemble des branches. Les branches sur le site CDTN récupérera le dernier sitemap généré.
