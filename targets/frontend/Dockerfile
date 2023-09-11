ARG NODE_VERSION=20.3.1-alpine

FROM node:$NODE_VERSION AS deps

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus frontend


FROM deps AS build-graphql-client
COPY shared/graphql-client ./shared/graphql-client
RUN yarn workspace @shared/graphql-client build

FROM deps AS build-types
COPY shared/types ./shared/types/
RUN yarn workspace @shared/types build

FROM deps as dist

COPY --from=build-graphql-client /app/shared/graphql-client /app/shared/graphql-client
COPY --from=build-types /app/shared/types /app/shared/types
COPY shared/eslint-config ./shared/eslint-config/
COPY shared/id-generator ./shared/id-generator/
COPY targets/frontend ./targets/frontend/

RUN yarn workspace frontend build

RUN yarn workspaces focus --production frontend && yarn cache clean
RUN mkdir -p targets/frontend/node_modules

FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist /app/shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist /app/shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist /app/shared/id-generator/src /app/shared/id-generator/src
COPY --from=dist /app/shared/id-generator/package.json /app/shared/id-generator/package.json
COPY --from=dist /app/shared/types/build /app/shared/types/build
COPY --from=dist /app/shared/types/package.json /app/shared/types/package.json
COPY --from=dist /app/targets/frontend/package.json /app/targets/frontend/package.json
COPY --from=dist /app/targets/frontend/next.config.js  /app/targets/frontend/next.config.js
COPY --from=dist /app/targets/frontend/.env  /app/targets/frontend/.env
COPY --from=dist /app/targets/frontend/public /app/targets/frontend/public
COPY --from=dist /app/targets/frontend/.next /app/targets/frontend/.next
COPY --from=dist /app/targets/frontend/node_modules /app/targets/frontend/node_modules
COPY --from=dist /app/package.json /app/package.json
COPY --from=dist /app/node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/targets/frontend

CMD ["node","../../node_modules/.bin/next","start"]

