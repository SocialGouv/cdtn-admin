# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24-alpine

# Manifests stage: seeds the install layer with version-blanked manifests, so a
# release bump does not invalidate it. See scripts/docker-prepare-manifests.js.
FROM node:$NODE_VERSION AS manifests

WORKDIR /manifests

COPY pnpm-lock.yaml .npmrc pnpm-workspace.yaml package.json ./
COPY shared/types/package.json ./shared/types/
COPY shared/utils/package.json ./shared/utils/
COPY shared/elasticsearch/package.json ./shared/elasticsearch/
COPY shared/eslint-config/package.json ./shared/eslint-config/
COPY targets/alert-cli/package.json ./targets/alert-cli/
COPY targets/frontend/package.json ./targets/frontend/
COPY targets/ingester/package.json ./targets/ingester/
COPY targets/export-elasticsearch/package.json ./targets/export-elasticsearch/

COPY scripts/docker-prepare-manifests.js ./
RUN node docker-prepare-manifests.js && rm docker-prepare-manifests.js


FROM node:$NODE_VERSION AS builder

RUN apk add --update --no-cache python3 make g++

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

# Workspace config + lockfile + version-normalized package.jsons for install
COPY --from=manifests /manifests/ ./

ENV HUSKY=0

# `.npmrc` interpolates ${NPM_TIPTAP_TOKEN}. When the variable is undefined pnpm
# discards the WHOLE file — including the `public-hoist-pattern` lines — instead
# of just that entry. Defining it empty keeps the rest of `.npmrc` honored.
ENV NPM_TIPTAP_TOKEN=

# Only export-elasticsearch and its workspace dependencies: the frontend tree
# (the sole @tiptap-pro consumer) is not needed here, so no registry token either.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter export-elasticsearch...

COPY shared/types ./shared/types/
RUN pnpm --filter=@socialgouv/cdtn-types run build

COPY shared/utils ./shared/utils/
RUN pnpm --filter=@shared/utils run build

COPY shared/eslint-config ./shared/eslint-config/
COPY shared/elasticsearch ./shared/elasticsearch/
COPY targets/export-elasticsearch ./targets/export-elasticsearch/
RUN pnpm --filter=export-elasticsearch run build


# Runner stage
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates && apk upgrade

ENV NODE_ENV=production

WORKDIR /app

# From the context, not the builder: the builder's copy went through the
# `manifests` stage and carries its rewritten formatting.
COPY package.json /app/package.json
COPY --from=builder /app/shared/utils/build /app/shared/utils/build
COPY --from=builder /app/shared/utils/package.json /app/shared/utils/package.json
COPY --from=builder /app/shared/utils/node_modules /app/shared/utils/node_modules
COPY --from=builder /app/shared/types/build /app/shared/types/build
COPY --from=builder /app/shared/types/package.json /app/shared/types/package.json
COPY --from=builder /app/shared/elasticsearch /app/shared/elasticsearch
COPY --from=builder /app/targets/export-elasticsearch/dataset /app/targets/export-elasticsearch/dataset
COPY --from=builder /app/targets/export-elasticsearch/package.json /app/targets/export-elasticsearch/package.json
COPY --from=builder /app/targets/export-elasticsearch/build /app/targets/export-elasticsearch/build
COPY --from=builder /app/targets/export-elasticsearch/node_modules /app/targets/export-elasticsearch/node_modules
COPY --from=builder /app/node_modules /app/node_modules

USER 1000

WORKDIR /app/targets/export-elasticsearch

CMD ["node", "build/index.js"]
