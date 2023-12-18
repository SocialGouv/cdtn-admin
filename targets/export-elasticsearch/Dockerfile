ARG NODE_VERSION=20.3.1-alpine

FROM node:$NODE_VERSION AS deps

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# hadolint ignore=SC2046
RUN yarn fetch workspaces focus export-elasticsearch

FROM deps AS build-utils
COPY shared/utils ./shared/utils
RUN yarn workspace @shared/utils build

FROM deps AS build-types
COPY shared/types ./shared/types
RUN yarn workspace @shared/types build

FROM deps as dist
COPY --from=build-utils /app/shared/utils ./shared/utils
COPY --from=build-types /app/shared/types ./shared/types

COPY shared/eslint-config ./shared/eslint-config/
COPY targets/export-elasticsearch ./targets/export-elasticsearch/

RUN yarn workspace export-elasticsearch build

RUN yarn workspaces focus --production export-elasticsearch && yarn cache clean
RUN mkdir -p /app/targets/export-elasticsearch/node_modules

FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist /app/shared/utils/build /app/shared/utils/build
COPY --from=dist /app/shared/utils/package.json /app/shared/utils/package.json
COPY --from=dist /app/shared/types/build /app/shared/types/build
COPY --from=dist /app/shared/types/package.json /app/shared/types/package.json
COPY shared/elasticsearch /app/shared/elasticsearch
COPY --from=dist /app/targets/export-elasticsearch/dataset /app/targets/export-elasticsearch/dataset
COPY --from=dist /app/targets/export-elasticsearch/package.json /app/targets/export-elasticsearch/package.json
COPY --from=dist /app/targets/export-elasticsearch/build /app/targets/export-elasticsearch/build
COPY --from=dist /app/targets/export-elasticsearch/node_modules /app/targets/export-elasticsearch/node_modules
COPY --from=dist /app/node_modules /app/node_modules


USER 1000

ENV NODE_ENV=production

WORKDIR /app/targets/export-elasticsearch

CMD ["yarn","start"]
