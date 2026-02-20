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

# Deploy: creates a standalone directory with flat node_modules (no symlinks)
# This is essential because Docker COPY dereferences symlinks, breaking pnpm's
# symlink-based module resolution in multi-stage builds
RUN pnpm --filter=export-elasticsearch deploy /app/deploy --prod


# Runner stage: minimal Node runtime
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates && apk upgrade

ENV NODE_ENV=production

WORKDIR /app/targets/export-elasticsearch

# Flat node_modules from pnpm deploy (includes all prod deps + workspace packages)
COPY --from=builder --chown=1000:1000 /app/deploy/node_modules ./node_modules
COPY --from=builder --chown=1000:1000 /app/deploy/package.json ./package.json
# Build output from tsc compilation
COPY --from=builder --chown=1000:1000 /app/targets/export-elasticsearch/build ./build
# Dataset is needed at runtime but not included in pnpm deploy (not in "files")
COPY --from=builder --chown=1000:1000 /app/targets/export-elasticsearch/dataset ./dataset

USER 1000

CMD ["node", "build/index.js"]
