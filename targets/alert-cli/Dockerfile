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
# Depth-anchored so a stray manifest deeper in the tree (a local `next build`
# leaves one under .next/standalone) cannot reach the output and shift its
# cache key. chmod because directory modes otherwise follow the build host.
RUN find ./shared ./targets -mindepth 2 -maxdepth 2 ! -name package.json -exec rm -rf {} + \
  && find ./shared ./targets -mindepth 1 -maxdepth 1 -type d -empty -delete \
  && find ./shared ./targets -type d -exec chmod 755 {} + \
  && node docker-prepare-manifests.js && rm docker-prepare-manifests.js


# Builder stage: install dependencies and build
FROM node:$NODE_VERSION AS builder

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
  pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter alert-cli...

# Build shared types
COPY shared/types ./shared/types/
RUN pnpm --filter=@socialgouv/cdtn-types run build

# Build shared utils
COPY shared/utils ./shared/utils/
RUN pnpm --filter=@shared/utils run build

# Build alert-cli
COPY targets/alert-cli ./targets/alert-cli/
RUN pnpm --filter=alert-cli run build


# Runner stage: minimal Node runtime
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates git openssh-client && apk upgrade

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/targets/alert-cli/dist ./dist/
COPY --from=builder /app/targets/alert-cli/package.json ./

USER 1000

CMD ["node", "--enable-source-maps", "--unhandled-rejections=strict", "./dist/index.js"]
