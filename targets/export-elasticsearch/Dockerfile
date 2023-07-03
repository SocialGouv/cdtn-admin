ARG NODE_VERSION=20.3.1-alpine

# dist
FROM node:$NODE_VERSION AS dist

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /

COPY shared/eslint-config/package.json /shared/eslint-config/package.json
COPY shared/graphql-client/package.json /shared/graphql-client/package.json
COPY shared/types/package.json /shared/types/package.json
COPY shared/elasticsearch-document-adapter/package.json /shared/elasticsearch-document-adapter/package.json
COPY targets/export-elasticsearch/package.json /targets/export-elasticsearch/package.json
COPY package.json /package.json
COPY yarn.lock /yarn.lock

RUN yarn --frozen-lockfile

COPY . /

RUN yarn workspace @shared/types build

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace @shared/elasticsearch-document-adapter build

RUN yarn workspace export-elasticsearch build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist shared/types/build /app/shared/types/build
COPY --from=dist shared/types/package.json /app/shared/types/package.json
COPY --from=dist shared/elasticsearch-document-adapter/lib /app/shared/elasticsearch-document-adapter/lib
COPY --from=dist shared/elasticsearch-document-adapter/package.json /app/shared/elasticsearch-document-adapter/package.json
COPY --from=dist shared/elasticsearch-document-adapter/package.json /app/shared/elasticsearch-document-adapter/package.json
COPY --from=dist targets/export-elasticsearch/dataset /app/export-elasticsearch/dataset
COPY --from=dist targets/export-elasticsearch/package.json /app/export-elasticsearch/package.json
COPY --from=dist targets/export-elasticsearch/build /app/export-elasticsearch/build
COPY --from=dist targets/export-elasticsearch/node_modules /app/export-elasticsearch/node_modules
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "--cwd", "export-elasticsearch", "start"]

