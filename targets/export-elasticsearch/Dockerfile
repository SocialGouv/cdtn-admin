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

# Use hoisted node-linker to create flat npm-style node_modules without symlinks.
# This is critical for Docker COPY: pnpm's default symlink structure places transitive
# deps in .pnpm/node_modules/ which Node.js resolution doesn't traverse.
RUN echo "node-linker=hoisted" >> /app/.npmrc

# Install ALL workspace dependencies (no --filter) to ensure transitive deps like uuid
# (from @shared/utils) are properly hoisted to root node_modules.
# Tiptap token is needed because frontend's package.json references @tiptap-pro packages.
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

COPY --from=builder --chown=1000:1000 /app/package.json /app/package.json
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

# Debug: verify key modules exist in the flat node_modules
RUN echo "=== Checking node_modules structure ===" && \
  ls -la /app/node_modules/uuid 2>&1 | head -5 && \
  ls -la /app/node_modules/express 2>&1 | head -5 && \
  ls -la /app/node_modules/inversify 2>&1 | head -5 && \
  echo "=== Checking .pnpm existence ===" && \
  ls -d /app/node_modules/.pnpm 2>&1 || echo "No .pnpm (expected with hoisted)" && \
  echo "=== Module resolution test ===" && \
  cd /app/targets/export-elasticsearch && \
  node -e "console.log('uuid:', require.resolve('uuid'))" && \
  node -e "console.log('express:', require.resolve('express'))" && \
  echo "=== Module checks passed ==="

# Smoke test: verify the server starts and /healthz responds
RUN cd /app/targets/export-elasticsearch && \
  echo "Starting server smoke test..." && \
  node build/index.js &>/tmp/server.log & SERVER_PID=$! && \
  sleep 3 && \
  if kill -0 $SERVER_PID 2>/dev/null; then \
  echo "Server is running (PID $SERVER_PID)" && \
  RESPONSE=$(wget -q -O- http://localhost:8787/healthz 2>&1) && \
  echo "Health check response: $RESPONSE" && \
  kill $SERVER_PID 2>/dev/null; \
  wait $SERVER_PID 2>/dev/null || true; \
  echo "Smoke test PASSED"; \
  else \
  echo "Server failed to start! Logs:" && \
  cat /tmp/server.log && \
  exit 1; \
  fi

USER 1000

WORKDIR /app/targets/export-elasticsearch

CMD ["node", "build/index.js"]
