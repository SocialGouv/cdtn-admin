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


FROM node:$NODE_VERSION AS builder

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

# Workspace config + lockfile + version-normalized package.jsons for install
COPY --from=manifests /manifests/ ./

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

# The mkdir is what makes the restore happen at all: `.next` does not exist yet
# here, so the `cp` into `.next/cache` fails and the mount stays write-only.
RUN --mount=type=cache,id=next-cache-frontend,target=/tmp/.next-cache \
  mkdir -p targets/frontend/.next && \
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
