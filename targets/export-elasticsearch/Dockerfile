ARG NODE_VERSION=20.3.1-alpine

FROM node:$NODE_VERSION AS deps

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# hadolint ignore=SC2046
RUN --mount=type=secret,id=npmTiptapToken,target=/secrets/npmTiptapToken \
  export NPM_TIPTAP_TOKEN=$(cat /secrets/npmTiptapToken); \
  yarn fetch workspaces focus export-elasticsearch

FROM deps AS build-graphql-client
COPY shared/graphql-client ./shared/graphql-client
RUN yarn workspace @shared/graphql-client build

FROM deps AS build-types
COPY shared/types ./shared/types
RUN yarn workspace @shared/types build

FROM deps AS build-cdtn-logger
COPY shared/logger ./shared/logger
RUN yarn workspace @socialgouv/cdtn-logger build

FROM deps AS build-elasticsearch-document-adapter
COPY --from=build-types /app/shared/types ./shared/types
COPY --from=build-cdtn-logger /app/shared/logger ./shared/logger
COPY shared/elasticsearch ./shared/elasticsearch
COPY shared/elasticsearch-document-adapter ./shared/elasticsearch-document-adapter
RUN yarn workspace @shared/elasticsearch-document-adapter build

FROM deps as dist
COPY --from=build-graphql-client /app/shared/graphql-client ./shared/graphql-client
COPY --from=build-types /app/shared/types ./shared/types
COPY --from=build-elasticsearch-document-adapter /app/shared/elasticsearch-document-adapter ./shared/elasticsearch-document-adapter
COPY --from=build-cdtn-logger /app/shared/logger ./shared/logger

COPY shared/eslint-config ./shared/eslint-config/
COPY targets/export-elasticsearch ./targets/export-elasticsearch/

RUN yarn workspace export-elasticsearch build

RUN yarn workspaces focus --production export-elasticsearch && yarn cache clean
RUN mkdir -p /app/targets/export-elasticsearch/node_modules

FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist /app/shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist /app/shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist /app/shared/types/build /app/shared/types/build
COPY --from=dist /app/shared/types/package.json /app/shared/types/package.json
COPY --from=dist /app/shared/logger/package.json /app/shared/logger/package.json
COPY --from=dist /app/shared/logger/lib /app/shared/logger/lib
COPY --from=dist /app/shared/elasticsearch-document-adapter/lib /app/shared/elasticsearch-document-adapter/lib
COPY --from=dist /app/shared/elasticsearch-document-adapter/package.json /app/shared/elasticsearch-document-adapter/package.json
COPY --from=dist /app/targets/export-elasticsearch/dataset /app/targets/export-elasticsearch/dataset
COPY --from=dist /app/targets/export-elasticsearch/package.json /app/targets/export-elasticsearch/package.json
COPY --from=dist /app/targets/export-elasticsearch/build /app/targets/export-elasticsearch/build
COPY --from=dist /app/targets/export-elasticsearch/node_modules /app/targets/export-elasticsearch/node_modules
COPY --from=dist /app/node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production

WORKDIR /app/targets/export-elasticsearch

CMD ["yarn","start"]
