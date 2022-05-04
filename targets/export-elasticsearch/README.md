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

## Testing in real

### 1. Run the container

At the root of the project, please run this command:

```sh
docker-compose up -d postgres   
docker-compose up -d hasura
```

In `code-du-travail-numerique` folder, run this command:

```sh
docker-compose up -d elasticsearch
```

### 2. Run fake storage service

```sh
npm install -g azurite # to install azurite
azurite # to run azurite
```

### 3. Restore the database

```sh
# restore from dump
docker-compose exec -T postgres pg_restore \
  --dbname postgres --clean --if-exists --user postgres \
  --no-owner --no-acl --verbose  < ../hasura_prod_db_27022022.psql.gz # path of dump

# restore user
docker-compose exec -T postgres psql \
  --dbname postgres --user postgres \
  < .kube-workflow/sql/post-restore.sql
```

### 4. Build code

To get latest shared package version:

```sh
yarn build # For building the code with typechecking
yarn # To link dependencies
```

> :warning: You have to run this command before running the ingester if you change a file in the shared package.

### 5. Run ingester in development mode

```sh
NLP_URL=https://serving-ml-preprod.dev.fabrique.social.gouv.fr ELASTICSEARCH_URL_PREPROD="http://localhost:9200" ELASTICSEARCH_URL_PROD="http://localhost:9200" AZ_ACCOUNT_KEY_FROM="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==" AZ_ACCOUNT_NAME_FROM="devstoreaccount1" AZ_URL_FROM="http://localhost:10000/devstoreaccount1" AZ_ACCOUNT_KEY_TO="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==" AZ_ACCOUNT_NAME_TO="devstoreaccount1" AZ_URL_TO="http://localhost:10000/devstoreaccount1" SITEMAP_DESTINATION_CONTAINER="sitemap" SITEMAP_DESTINATION_NAME="sitemap.xml" SITEMAP_ENDPOINT="https://code.travail.gouv.fr/sitemap.xml" CDTN_ADMIN_ENDPOINT="http://localhost:8080/v1/graphql" SOURCE_CONTAINER_COPY="sitemap" DESTINATION_CONTAINER_COPY="testcopy" ELASTICSEARCH_INDEX_PREPROD="cdtn-v1" ELASTICSEARCH_INDEX_PROD="cdtn-v1" yarn workspace export-elasticsearch dev

# OR
yarn workspace export-elasticsearch dev:env
```

> **Note**: You can remove `NLP_URL` from your environment variables if you don't want to use the NLP service and gain time during the process of ingester elasticsearch.

### 6. Get the id of the user

Open console by running this command:

```sh
hasura console --envfile ../../.env --project targets/hasura
```

1. Navigate in `Data`  tab
2. Select `auth` schema
3. Click on `users`
4. Get the id of the user

### 7. Run the export elasticsearch

#### With cURL

```sh
curl -X POST -H "Content-Type: application/json" -d '{"environment": "preproduction", "userId": "6ea2dd9f-8017-4375-bcfe-dbce35c600b3"}' http://localhost:8787/export # thanks to id of the user found
```

#### With frontend ui

```sh
yarn workspace frontend dev
```

1. Go to `http://localhost:3000/`
2. Connect to the frontend ui with `codedutravailnumerique@travail.gouv.fr` and `admin` as password.
3. Navigate to `Mise à jour`
4. Click on `Mettre à jour la pre-production` or `Mettre à jour la production`
