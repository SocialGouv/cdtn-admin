# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24-alpine

# Builder stage: install dependencies and build
FROM node:$NODE_VERSION AS builder

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
