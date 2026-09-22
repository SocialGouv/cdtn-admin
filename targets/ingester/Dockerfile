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
# reaches the output; the script then drops any manifest the lockfile does not
# declare. Modes are set explicitly rather than with `u=rwX`, whose X keeps an
# already-executable file executable — mode is part of the cache key downstream.
RUN find ./shared ./targets -mindepth 2 -maxdepth 2 ! -name package.json -exec rm -rf {} + \
  && find ./shared ./targets -mindepth 1 -maxdepth 1 ! -type d -exec rm -rf {} + \
  && find ./shared ./targets -mindepth 1 -maxdepth 1 -type d -empty -delete \
  && find . -type d -exec chmod 0755 {} + && find . -type f -exec chmod 0644 {} + \
  && node docker-prepare-manifests.js && rm docker-prepare-manifests.js


# Builder stage: install dependencies and build
FROM node:$NODE_VERSION AS builder

# Native dependencies for some npm packages
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app

# Enable pnpm via corepack
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

# Install dependencies with pnpm store cache
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter ingester...

# Build shared types
COPY shared/types ./shared/types/
RUN pnpm --filter=@socialgouv/cdtn-types run build

# Build shared utils
COPY shared/utils ./shared/utils/
RUN pnpm --filter=@shared/utils run build

# Build ingester
COPY targets/ingester ./targets/ingester/
RUN pnpm --filter=ingester run build


# Runner stage: minimal Node runtime
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates && apk upgrade

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/targets/ingester/dist/ /app/dist/
COPY --from=builder /app/targets/ingester/package.json /app/

USER 1000

CMD ["node", "--enable-source-maps", "--unhandled-rejections=strict", "dist/index.js"]
