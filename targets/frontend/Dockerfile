ARG NODE_VERSION=14.18.0-alpine3.11

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist shared/graphql-client/src /app/shared/graphql-client/src
COPY --from=dist shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist shared/id-generator/src /app/shared/id-generator/src
COPY --from=dist shared/id-generator/package.json /app/shared/id-generator/package.json
COPY --from=dist shared/id-generator/node_modules /app/shared/id-generator/node_modules
COPY --from=dist shared/types/index.d.ts /app/shared/types/index.d.ts
COPY --from=dist shared/types/package.json /app/shared/types/package.json
COPY --from=dist targets/frontend/package.json /app/targets/frontend/package.json
COPY --from=dist targets/frontend/next.config.js  /app/targets/frontend/next.config.js
COPY --from=dist targets/frontend/.env  /app/targets/frontend/.env
COPY --from=dist targets/frontend/public/ /app/targets/frontend/public
COPY --from=dist targets/frontend/.next/ /app/targets/frontend/.next
COPY --from=dist targets/frontend/node_modules/ /app/targets/frontend/node_modules
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "workspace", "frontend", "start"]

