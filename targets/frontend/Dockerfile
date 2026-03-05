# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24-alpine

FROM node:$NODE_VERSION AS builder

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

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

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  --mount=type=secret,id=NPM_TIPTAP_TOKEN \
  sh -c 'export NPM_TIPTAP_TOKEN=$(cat /run/secrets/NPM_TIPTAP_TOKEN 2>/dev/null || true) && \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store'

COPY shared/types ./shared/types/
RUN pnpm --filter=@socialgouv/cdtn-types run build

COPY shared/utils ./shared/utils/
RUN pnpm --filter=@shared/utils run build

ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT
ENV NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT=$NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT
ARG NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER
ENV NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER=$NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER
ARG NEXT_PUBLIC_BUCKET_DRAFT_FOLDER
ENV NEXT_PUBLIC_BUCKET_DRAFT_FOLDER=$NEXT_PUBLIC_BUCKET_DRAFT_FOLDER

COPY shared/eslint-config ./shared/eslint-config/
COPY targets/frontend ./targets/frontend/

RUN --mount=type=cache,id=next-cache-frontend,target=/tmp/.next-cache \
  cp -a /tmp/.next-cache targets/frontend/.next/cache 2>/dev/null || true && \
  pnpm --filter=frontend run build && \
  rm -rf /tmp/.next-cache/* && \
  cp -a targets/frontend/.next/cache/. /tmp/.next-cache/ 2>/dev/null || true


# Runner stage: standalone output — no node_modules copy needed
FROM node:$NODE_VERSION AS runner

RUN apk --update --no-cache add ca-certificates && apk upgrade

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Standalone output contains only the files needed to run
COPY --from=builder /app/targets/frontend/.next/standalone ./
COPY --from=builder /app/targets/frontend/.next/static ./targets/frontend/.next/static
COPY --from=builder /app/targets/frontend/public ./targets/frontend/public

USER 1000

WORKDIR /app/targets/frontend

CMD ["node", "server.js"]
