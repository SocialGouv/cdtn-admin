# export-elasticsearch

This service exposes an API which handle to trigger the export of the data from Postgres to Elasticsearch. Then, copy sitemap.xml from a container azure to an other container azure. To finish, it copies a container azure to an other container azure.

## Building and running the code

```sh
yarn build # For building the code with typechecking
yarn build:swc # For building without typechecking
yarn start # For running the code builded
```

Or in `development` mode:

```sh
yarn dev # For running the code in development thanks to swc and nodemon
```

> **/!\ No typechecking made in dev mode**

## Testing the code

```sh
yarn test # For running unit test
yarn test:watch # For watching unit test
```

## Environment variable

| Name                   | Description                                                                                     | Default value |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------- |
| `DISABLE_LIMIT_EXPORT` | It allows you to disable concurrent run in ingester (by default it's one hour between each run) | undefined     |
| `DISABLE_INGESTER`     | It allows you to disable ingester in the process of export                                      | undefined     |
| `DISABLE_SITEMAP`      | It allows you to disable copy of the sitemap                                                    | undefined     |
| `DISABLE_COPY`         | It allows you to disable copy between two containers                                            | undefined     |
| `DISABLE_GLOSSARY`     | It allows you to disable the glossary (inject tooltips in contents)                             | undefined     |

## Testing in real

### 1. Install and build dependencies

At the root of the project

```sh
yarn # to install dep
yarn build # to build project
```

### 2. Run the postgres to add data

At the root of the project, please run this command:

```sh
docker-compose up -d postgres
```

### 3. Load data from production to local

#### 1. Restore data

```sh
docker-compose exec -T postgres pg_restore \
  --dbname postgres --clean --if-exists --user postgres \
  --no-owner --no-acl --verbose  < ~/MY_PATH/hasura_prod_db.psql
```

#### 2. Restore roles

```sh
docker-compose exec -T postgres psql \
  --dbname postgres --user postgres \
  < .kontinuous/sql/post-restore.sql
```

### 4. Run the other containers

```sh
docker-compose up -d hasura azurite elasticsearch
```

### 5. Run ingester in development mode

```sh
GLOSSARY_PREPROD_DISABLE=true DISABLE_LIMIT_EXPORT=true DISABLE_SITEMAP=true DISABLE_COPY=true NLP_URL=https://serving-ml-preprod.dev.fabrique.social.gouv.fr HASURA_GRAPHQL_ENDPOINT="http://localhost:8080/v1/graphql" HASURA_GRAPHQL_ADMIN_SECRET="admin1" ELASTICSEARCH_URL_PREPROD="http://localhost:9200" ELASTICSEARCH_URL_PROD="http://localhost:9200" AZ_ACCOUNT_KEY_FROM="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==" AZ_ACCOUNT_NAME_FROM="devstoreaccount1" AZ_URL_FROM="http://localhost:10000/devstoreaccount1" AZ_ACCOUNT_KEY_TO="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==" AZ_ACCOUNT_NAME_TO="devstoreaccount1" AZ_URL_TO="http://localhost:10000/devstoreaccount1" SITEMAP_DESTINATION_CONTAINER="sitemap" SITEMAP_DESTINATION_NAME="sitemap.xml" SITEMAP_ENDPOINT="http://localhost:3000/api/sitemap" CDTN_ADMIN_ENDPOINT="http://localhost:8080/v1/graphql" SOURCE_CONTAINER_COPY="sitemap" DESTINATION_CONTAINER_COPY="testcopy" ELASTICSEARCH_INDEX_PREPROD="cdtn-v2" ELASTICSEARCH_INDEX_PROD="cdtn-v2" yarn workspace export-elasticsearch dev
```

- `DISABLE_LIMIT_EXPORT` is used to disable the limit to run two export in less than one hour
- `DISABLE_COPY` is used to disable copy between two containers
- `DISABLE_SITEMAP` is used to disable copy of the sitemap
- `GLOSSARY_PREPROD_DISABLE` is used to disable glossary to gain time.

> **Note**: You can remove `NLP_URL` from your environment variables if you don't want to use the NLP service and gain time during the process of ingester elasticsearch.

### 6. Run the export elasticsearch

#### With cli

```sh
yarn workspace export-elasticsearch run:ingester
```

#### With frontend ui

```sh
yarn workspace frontend dev
```

1. Go to `http://localhost:3000/`
2. Connect to the frontend ui with `codedutravailnumerique@travail.gouv.fr` and `admin` as password.
3. Navigate to `Mise à jour`
4. Click on `Mettre à jour la pre-production` or `Mettre à jour la production`
