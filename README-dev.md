# Code du travail numérique - Administration - dev

## URLs

| Environnement                                      | URL                                           |
| -------------------------------------------------- | --------------------------------------------- |
| Production (access granted only for authorized IP) | <https://cdtn-admin.fabrique.social.gouv.fr/> |

## Overview

This git repository is a monorepo composed of 4 projects.

### Hasura

Used to expose data through a GraphQL API.
It contains the metadata and migrations for Hasura.

See the [Hasura documentation](https://hasura.io/docs/1.0/graphql/core/index.html) for more information.
We recommend to [install the hasura console](https://hasura.io/docs/1.0/graphql/core/hasura-cli/install-hasura-cli.html) which provides a graphql sandbox and an administration UI for hasura.

` ``

### Ingester

Used to populate the database with documents provided by external sources.

There is, at this moment (February 2021), 4 sources:

- [@SocialGouv/contributions-data](https://github.com/SocialGouv/contributions-data)
- [@SocialGouv/fiches-travail-data](https://github.com/SocialGouv/fiches-travail-data)
- [@SocialGouv/fiches-vdd](https://github.com/SocialGouv/fiches-vdd)
- [@SocialGouv/kali-data](https://github.com/SocialGouv/kali-data)
- [@SocialGouv/legi-data](https://github.com/SocialGouv/legi-data)

Each GitHub repo uses releases to track changes. Each release exposes content as JSON.
Ingester retrieves the last version and inject data into Hasura.

### alert-cli

Used to detect changes between external source packages.
For each new release of an external packages, this script compares the content and insert diff in the database.

See [documentation](targets/alert-cli/README.md) for more detail.

## Setup

Make sure you're using NodeJS 12+.

```sh
# Install all the packages
$ yarn
$ yarn build
```

It's easy to setup a new environment with docker compose :

```sh
docker-compose up
```

The docker compose performs several steps.

### Configure a postgreSQL database

A postgreSQL database is used to store the data exposed through a Hasura instance.

> Start only the postgreSQL instance:
>
> ```sh
> docker-compose up postgres
> ```

### Configure a Hasura instance

A Hasura instance is used to expose the data stored in postgreSQL through a GraphQL API.
See the [Hasura documentation](https://hasura.io/docs/1.0/graphql/core/index.html) for more information.

This step creates a new Hasura instance with the schema,
and some data (see [metadata](targets/hasura/metadata) and [migrations](targets/hasura/migrations) files of hasura target).

To access to the Hasura console, run this command:

```sh
hasura console --envfile ../../.env --project targets/hasura
```

A webpage is opened in your browser. The password is `admin1` as set in the `.env` file (`HASURA_GRAPHQL_ADMIN_SECRET` key).

> Start only the Hasura instance (it starts the postgreSQL as dependency):
>
> ```sh
> docker-compose up hasura
> ```

### Inject documents

A part of the content is based on documents retrieved from another services (code du travail, contributions, fiche travail/emploi...).

This step runs the Ingester script and populate the documentation.

This step doesn't work correctly at this moment, an (issue)[https://github.com/SocialGouv/cdtn-admin/issues/319] has been opened to fix it.

> Run the Ingester (it starts Hasura as dependency):
>
> ```sh
> docker-compose up ingester
> ```

### Frontend

An administration website is available to configure and inject custom data.

This step starts the frontend project (based on `next.js`).
User and admin accounts are automatically created by the Hasura step.

| Type  | Username                               | Password |
| ----- | -------------------------------------- | -------- |
| Admin | codedutravailnumerique@travail.gouv.fr | admin1   |
| User  | utilisateur@travail.gouv.fr            | user     |

Frontend is reachable at the address <http://localhost:3000>

> Run the frontend (it starts Hasura as dependency):
>
> ```sh
> docker-compose up www
> ```
>
> or via npm
>
> ```sh
> yarn workspace frontend dev
> ```

That's all 🎉

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

### How to retrieve CDTN data from production ?

At this moment, the database is populated only by external documents (contributions, code du travail...).
All CDTN data (written by the CDTN team) are not populated in the database.
An [issue](https://github.com/SocialGouv/cdtn-admin/issues/320) has been opened to find the better way to import data from the production into a dev environment.

Once you have a backup, you can restore from a previous backup using 
```sh
docker-compose exec -T postgres pg_restore \
  --dbname postgres --clean --if-exists --user postgres \
  --no-owner --no-acl --verbose  < ~/Downloads/hasura_prod_db.psql
``` 
et pour remettre les utilisateurs par défaut
```sh
docker-compose exec -T postgres psql \
  --dbname postgres --user postgres \
  < .k8s/components/jobs/restore/post-restore.sql
```
