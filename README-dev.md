# Code du travail numérique - Administration - dev

## Setup

Pour intialiser le projet, nous avons besoin d'une dépendance depuis le registry privé de [tiptap](https://tiptap.dev/). Suivez les étapes suivantes :

* [Créer un compte (gratuit)](https://tiptap.dev/register) sur tiptap.
* Se rendre sur la page [Pro Extensions](https://collab.tiptap.dev/pro-extensions) de votre compte pour récupérer le token
* Créer un fichier `.npmTiptapToken.secret` contenant le token. Il sera utile pour `docker compose` et pour direnv (si l'on souhaite automatiser le chargement de la variable `NPM_TIPTAP_TOKEN`)
* Exporter la variable `NPM_TIPTAP_TOKEN` dans votre shell courant ou, pour automatiser cette étape, passer à l'étape suivante
* (optionnel) Pour automatiser la chargement de cette variable lorsque l'on est dans le dossier du projet, il est possible d'installer [direnv](https://direnv.net/).
  ```sh
  curl -sfL https://direnv.net/install.sh | bash
  ```
  Le fichier `.npmTiptapToken.secret` contenant le token sera chargé par le fichier .envrc déjà présent à la racine.
  Il faut ensuite executer `direnv allow` (et il faudra exécuter cette commande après chaque changement du fichier .envrc pour autoriser direnv à charger son contenu automatiquement lorsque le shell est dans le dossier)

Vous pouvez maintenant lancer la commande `yarn install` pour installer les packages du projet.

## URLs

| Environnement                                      | URL                                                       |
|----------------------------------------------------|-----------------------------------------------------------|
| Production (access granted only for authorized IP) | <https://cdtn-admin.fabrique.social.gouv.fr/>             |
| Preproduction                                      | <https://preprod-cdtn-admin.dev.fabrique.social.gouv.fr/> |

## Overview

This git repository is a monorepo composed of 5 projects.

### Hasura

Used to expose data through a GraphQL API. It contains the metadata and migrations for Hasura.

See the [Hasura documentation](https://hasura.io/docs/1.0/graphql/core/index.html) for more information. We recommend
to [install the hasura console](https://hasura.io/docs/1.0/graphql/core/hasura-cli/install-hasura-cli.html) which
provides a graphql sandbox and an administration UI for hasura.

### Ingester

Used to populate the database with documents provided by external sources.

There is, at this moment (February 2021), 5 sources:

- [@SocialGouv/contributions-data](https://github.com/SocialGouv/contributions-data)
- [@SocialGouv/fiches-travail-data](https://github.com/SocialGouv/fiches-travail-data)
- [@SocialGouv/fiches-vdd](https://github.com/SocialGouv/fiches-vdd)
- [@SocialGouv/kali-data](https://github.com/SocialGouv/kali-data)
- [@SocialGouv/legi-data](https://github.com/SocialGouv/legi-data)

Each GitHub repo uses releases to track changes. Each release exposes content as JSON. Ingester retrieves the last
version and inject data into Hasura.

### alert-cli

Used to detect changes between external source packages. For each new release of an external packages, this script
compares the content and insert diff in the database.

See [documentation](targets/alert-cli/README.md) for more detail.

## Setup

Make sure you're using the last NodeJS.

```sh
# Install all the packages
$ yarn
$ yarn build
```

It's easy to setup a new environment with docker compose :

```sh
docker compose up
```

The docker compose performs several steps.

### Configure a postgreSQL database

A postgreSQL database is used to store the data exposed through a Hasura instance.

> Start only the postgreSQL instance:
>
> ```sh
> docker compose up postgres
> ```

### Configure a Hasura instance

A Hasura instance is used to expose the data stored in postgreSQL through a GraphQL API. See
the [Hasura documentation](https://hasura.io/docs/1.0/graphql/core/index.html) for more information.

This step creates a new Hasura instance with the schema, and some data (see [metadata](targets/hasura/metadata)
and [migrations](targets/hasura/migrations) files of hasura target).

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

### Inject documents

A part of the content is based on documents retrieved from another services (code du travail, contributions, fiche
travail/emploi...).

This step runs the Ingester script and populate the documentation.

> Run the Ingester (/!\ hasura must be started):
>
> ```sh
> yarn workspace ingester run cli:dev
> ```

### Frontend

An administration website is available to configure and inject custom data.

This step starts the frontend project (based on `next.js`). User and admin accounts are automatically created by the
Hasura step.

| Type  | Username                               | Password |
|-------|----------------------------------------|----------|
| Admin | codedutravailnumerique@travail.gouv.fr | admin    |
| User  | utilisateur@travail.gouv.fr            | user     |

Frontend is reachable at the address <http://localhost:3000>

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

## Données

### Table public.documents

La table documents dans le schéma public contient les documents qui se transforment (pour la plus grande partie) en page sur le site du code du travail numérique.

Voici un tableau descriptif des champs de cette table :

| Nom du champ     | type                     | Description                                                                                                                                                                                                                                                                                                                                               |
|------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cdtn_id          | text                     | Identifiant unique générer par la méthode `generateCdtnId` dans le package `shared/id-generator`                                                                                                                                                                                                                                                          |
| initial_id       | text                     | L'identifiant externe du document (pour les contenus legifrance c'est le `KALIARTI` renvoyé par l'API, pour la fiche service publique c'est l'identifiant `FXXX` fourni, pour les contenus internes c'est un UUID généré...)                                                                                                                              |
| title            | text                     | Le titre de la page qui sera affiché dans le H1. Attention, il y a également le `meta_title` qui peut être présent dans le champ `document`                                                                                                                                                                                                               |
| meta_description | text                     | La meta description de la page                                                                                                                                                                                                                                                                                                                            |
| source           | text                     | L'identifiant de la source, voici la liste: (`dossiers`, `prequalified`, `conventions_collectives`, `external`, `themes`, `contributions`, `page_fiche_ministere_travail`, `information`, `outils`, `highlights`, `modeles_de_courriers`, `fiches_service_public`, `code_du_travail`)                                                                     |
| slug             | text                     | Le slug présent dans l'URL utilisé comme identifiant unique pour récupérer le contenu dans la page depuis le front                                                                                                                                                                                                                                        |
| text             | text                     | Contenu de la page en format texte brut pour générer les vecteurs de recherche                                                                                                                                                                                                                                                                            |
| document         | jsonb                    | Contenu de la page dans un format `jsonb` (attention, ça peut être un peu un fourre-tout)                                                                                                                                                                                                                                                                 |
| is_published     | boolean                  | Permet d'activer/désactiver la génération d'une page sur le site associé au contenu. Utilisé pour dépublier du contenu par l'équipe métier. Attention, actuellement utilisé également pour permettre la recherche de convention collective qui ne possèdent pas de page associée issue du projet `kali-data`                                                                          |
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

Dans un premier temps, il faut lancer un elasticsearch. La documentation est disponible dans le
projet [readme dev](https://github.com/SocialGouv/code-du-travail-numerique/blob/master/README-dev.md) du
projet [code-du-travail-numerique](https://github.com/SocialGouv/code-du-travail-numerique).

Il faut ensuite lancer l'`ingester-elasticsearch` pour alimenter l'elasticsearch. Ce dernier récupérant les données
depuis hasura, il est préférable de récupérer les données de prod (
cf : [Injecter les données depuis la production](https://github.com/SocialGouv/cdtn-admin/blob/master/README-dev.md#injecter-les-donnees-depuis-la-production))

Pour lancer l'`ingester-elasticsearch`, reporter vous à la [documentation `export-elasticsearch`](./targets/export-elasticsearch/README.md)

**Note :** La durée d'exécution prend du temps (environ 15 minutes)

Par défaut, la commande va alimenter l'elasticsearch en local sur le port 9200 qui est le port utilisé par
l'elasticsearch du projet [code-du-travail-numerique](https://github.com/SocialGouv/code-du-travail-numerique).

Ce script utilise les variables suivantes :

| Variable                    | Description                                                                                                          | Par défaut                                                                             |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
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

### Désynchronisation des PRs et des pipelines Gitlab

**Symptômes:**

À chaque PR Github, le check `ci/gitlab/gitlab.factory.social.gouv.fr` reste bloqué
sur `Expected — Waiting for status to be reported`. Sur Gitlab, la branche est bien présente et la pipeline associée
fonctionne.

**Résolution:**

Il faut mettre à jour le token Github. Commencez par créer
un [nouveau token Github](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
, sélectionnez le scope `repo` sans expiration.

Puis dans Gitlab, `cdtn-admin > Settings > Integrations > Github`, copiez le token Github, cliquez sur `Test settings`
et si OK, cliquez sur `Save changes`.

Pour relancer les checks sur les PRs, vous pouvez supprimer la branche dans gitlab et relancer le check 🇫🇷 sur Github.

## Compter le nombre de documents totaux

```gql
query GetAllDocuments($sources: [String!]) {
  documents(where: {source: {_in: $sources}}) {
    cdtn_id
  }
}
```

With published documents:

```gql
query GetAllDocumentsPublished($sources: [String!]) {
  documents(where: {is_published: {_eq: true}, source: {_in: $sources}}) {
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
