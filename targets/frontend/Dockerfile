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
  --mount=type=secret,id=NPM_TIPTAP_TOKEN \
  sh -c 'export NPM_TIPTAP_TOKEN=$(cat /run/secrets/NPM_TIPTAP_TOKEN 2>/dev/null || true) && \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store'

# Build shared types
COPY shared/types ./shared/types/
RUN pnpm --filter=@socialgouv/cdtn-types run build

# Build shared utils
COPY shared/utils ./shared/utils/
RUN pnpm --filter=@shared/utils run build

# App build args
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT
ENV NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT=$NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT
ARG NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER
ENV NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER=$NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER
ARG NEXT_PUBLIC_BUCKET_DRAFT_FOLDER
ENV NEXT_PUBLIC_BUCKET_DRAFT_FOLDER=$NEXT_PUBLIC_BUCKET_DRAFT_FOLDER

# Copy source code and build with Next.js cache persisted across builds
COPY shared/eslint-config ./shared/eslint-config/
COPY targets/frontend ./targets/frontend/

RUN --mount=type=cache,id=next-cache-frontend,target=/tmp/.next-cache \
  cp -a /tmp/.next-cache targets/frontend/.next/cache 2>/dev/null || true && \
  pnpm --filter=frontend run build && \
  rm -rf /tmp/.next-cache/* && \
  cp -a targets/frontend/.next/cache/. /tmp/.next-cache/ 2>/dev/null || true

RUN mkdir -p targets/frontend/node_modules


# Runner stage: minimal Node runtime
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates && apk upgrade

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=builder --chown=1000:1000 --chmod=555 /app/shared/utils/build /app/shared/utils/build
COPY --from=builder --chown=1000:1000 --chmod=555 /app/shared/utils/package.json /app/shared/utils/package.json
COPY --from=builder --chown=1000:1000 --chmod=555 /app/shared/types/build /app/shared/types/build
COPY --from=builder --chown=1000:1000 --chmod=555 /app/shared/types/package.json /app/shared/types/package.json
COPY --from=builder --chown=1000:1000 --chmod=555 /app/targets/frontend/package.json /app/targets/frontend/package.json
COPY --from=builder --chown=1000:1000 --chmod=555 /app/targets/frontend/next.config.js /app/targets/frontend/next.config.js
COPY --from=builder --chown=1000:1000 --chmod=555 /app/targets/frontend/public /app/targets/frontend/public
COPY --from=builder --chown=1000:1000 --chmod=555 /app/targets/frontend/.next /app/targets/frontend/.next
COPY --from=builder --chown=1000:1000 --chmod=555 /app/targets/frontend/node_modules /app/targets/frontend/node_modules
COPY --from=builder --chown=1000:1000 --chmod=555 /app/package.json /app/package.json
COPY --from=builder --chown=1000:1000 --chmod=555 /app/node_modules /app/node_modules

USER 1000

WORKDIR /app/targets/frontend

CMD ["./node_modules/.bin/next", "start"]
