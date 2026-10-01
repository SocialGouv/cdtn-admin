# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24-alpine

# Manifests stage: seeds the install layer with version-blanked manifests, so a
# release bump does not invalidate it. See scripts/docker-prepare-manifests.js.
FROM node:$NODE_VERSION AS manifests

WORKDIR /manifests

COPY pnpm-lock.yaml .npmrc pnpm-workspace.yaml package.json ./
# The `pnpm-workspace.yaml` globs, copied wholesale then pruned to manifests:
# a new workspace member arrives on its own instead of silently missing here.
COPY shared/ ./shared/
COPY targets/ ./targets/

COPY scripts/docker-prepare-manifests.js ./
# Anchored on both sides so nothing below depth 2 and nothing loose at depth 1
# reaches the output; what remains sits where a workspace glob selects, and the
# script refuses any manifest the lockfile does not declare. Modes are set
# explicitly rather than with `u=rwX`, whose X keeps an already-executable file
# executable — mode is part of the cache key downstream.
RUN find ./shared ./targets -mindepth 2 -maxdepth 2 ! -name package.json -exec rm -rf {} + \
  && find ./shared ./targets -mindepth 1 -maxdepth 1 ! -type d -exec rm -rf {} + \
  && find ./shared ./targets -mindepth 1 -maxdepth 1 -type d -empty -delete \
  && find . -type d -exec chmod 0755 {} + && find . -type f -exec chmod 0644 {} + \
  && node docker-prepare-manifests.js && rm docker-prepare-manifests.js


# Runtime dependency tree: the builder needs devDependencies to typecheck, the
# runner does not. Keyed on the manifests stage alone, so it survives a release.
FROM node:$NODE_VERSION AS deps-prod

RUN apk add --update --no-cache python3 make g++

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

COPY --from=manifests /manifests/ ./

ENV HUSKY=0
ENV NPM_TIPTAP_TOKEN=
# The root `prepare` runs `test -n "$CI" || husky install`, and husky is a dev
# dependency absent from a --prod tree; CI is the guard the script itself expects.
ENV CI=true

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter export-elasticsearch... --prod


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

# From the context, not the builder: the root manifest has no `version` today so
# the `manifests` stage leaves it untouched, but taking it from the context keeps
# that true if one is ever added.
COPY package.json /app/package.json
COPY --from=builder /app/shared/utils/build /app/shared/utils/build
COPY --from=builder /app/shared/utils/package.json /app/shared/utils/package.json
COPY --from=deps-prod /app/shared/utils/node_modules /app/shared/utils/node_modules
COPY --from=builder /app/shared/types/build /app/shared/types/build
COPY --from=builder /app/shared/types/package.json /app/shared/types/package.json
COPY --from=builder /app/shared/elasticsearch /app/shared/elasticsearch
COPY --from=builder /app/targets/export-elasticsearch/dataset /app/targets/export-elasticsearch/dataset
COPY --from=builder /app/targets/export-elasticsearch/package.json /app/targets/export-elasticsearch/package.json
COPY --from=builder /app/targets/export-elasticsearch/build /app/targets/export-elasticsearch/build
COPY --from=deps-prod /app/targets/export-elasticsearch/node_modules /app/targets/export-elasticsearch/node_modules
COPY --from=deps-prod /app/node_modules /app/node_modules

USER 1000

WORKDIR /app/targets/export-elasticsearch

CMD ["node", "build/index.js"]
