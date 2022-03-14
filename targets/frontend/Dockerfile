ARG NODE_VERSION=14.18.0-slim

FROM node:$NODE_VERSION AS build

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace frontend build

FROM node:$NODE_VERSION

WORKDIR /app

COPY package.json yarn.lock /app/

COPY --from=build shared/graphql-client/src /app/shared/graphql-client/src
COPY --from=build shared/graphql-client/package.json /app/shared/graphql-client/
COPY --from=build shared/id-generator/src /app/shared/id-generator/src
COPY --from=build shared/id-generator/package.json /app/shared/id-generator/
COPY --from=build shared/types/index.d.ts /app/shared/types/
COPY --from=build shared/types/package.json /app/shared/types/

COPY --from=build targets/frontend/package.json /app/targets/frontend/

# NOTE(douglasduteil): disable most post install script by faking a CI
ENV CI=true
RUN  npx @socialgouv/yarn-workspace-focus-install \
  --cwd targets/frontend \
  --production \
  -- \
  --frozen-lockfile \
  --prefer-offline

COPY --from=build targets/frontend/next.config.js  /app/targets/frontend/
COPY --from=build targets/frontend/.env  /app/targets/frontend/
COPY --from=build targets/frontend/public/ /app/targets/frontend/public
COPY --from=build targets/frontend/.next/ /app/targets/frontend/.next

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "--cwd", "targets/frontend", "start"]
