# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24-alpine

# Builder stage: install dependencies and build
FROM node:$NODE_VERSION AS builder

# Native dependencies for some npm packages
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app

# Enable pnpm via corepack
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

# Copy workspace config + lockfile + package.jsons for install
COPY pnpm-lock.yaml .npmrc pnpm-workspace.yaml package.json ./
COPY shared/types/package.json ./shared/types/
COPY shared/utils/package.json ./shared/utils/
COPY shared/elasticsearch/package.json ./shared/elasticsearch/
COPY shared/eslint-config/package.json ./shared/eslint-config/
COPY targets/alert-cli/package.json ./targets/alert-cli/
COPY targets/frontend/package.json ./targets/frontend/
COPY targets/ingester/package.json ./targets/ingester/
COPY targets/export-elasticsearch/package.json ./targets/export-elasticsearch/

ENV HUSKY=0

# Install dependencies with pnpm store cache
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter export-elasticsearch...

# Build shared types
COPY shared/types ./shared/types/
RUN pnpm --filter=@socialgouv/cdtn-types run build

# Build shared utils
COPY shared/utils ./shared/utils/
RUN pnpm --filter=@shared/utils run build

# Build export-elasticsearch
COPY shared/eslint-config ./shared/eslint-config/
COPY shared/elasticsearch ./shared/elasticsearch/
COPY targets/export-elasticsearch ./targets/export-elasticsearch/
RUN pnpm --filter=export-elasticsearch run build

RUN mkdir -p /app/targets/export-elasticsearch/node_modules


# Runner stage: minimal Node runtime
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates && apk upgrade

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder --chown=1000:1000 /app/shared/utils/build /app/shared/utils/build
COPY --from=builder --chown=1000:1000 /app/shared/utils/package.json /app/shared/utils/package.json
COPY --from=builder --chown=1000:1000 /app/shared/types/build /app/shared/types/build
COPY --from=builder --chown=1000:1000 /app/shared/types/package.json /app/shared/types/package.json
COPY --from=builder --chown=1000:1000 /app/shared/elasticsearch /app/shared/elasticsearch
COPY --from=builder --chown=1000:1000 /app/targets/export-elasticsearch/dataset /app/targets/export-elasticsearch/dataset
COPY --from=builder --chown=1000:1000 /app/targets/export-elasticsearch/package.json /app/targets/export-elasticsearch/package.json
COPY --from=builder --chown=1000:1000 /app/targets/export-elasticsearch/build /app/targets/export-elasticsearch/build
COPY --from=builder --chown=1000:1000 /app/targets/export-elasticsearch/node_modules /app/targets/export-elasticsearch/node_modules
COPY --from=builder --chown=1000:1000 /app/node_modules /app/node_modules

USER 1000

WORKDIR /app/targets/export-elasticsearch

CMD ["node", "build/index.js"]
