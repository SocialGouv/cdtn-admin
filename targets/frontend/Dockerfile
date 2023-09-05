ARG NODE_VERSION=20.3.1-alpine

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn workspace frontend focus

COPY shared/eslint-config ./shared/eslint-config
COPY shared/graphql-client ./shared/graphql-client
COPY shared/id-generator ./shared/id-generator
COPY shared/types ./shared/types

RUN yarn workspace @shared/types build
RUN yarn workspace @shared/graphql-client build
RUN yarn workspace frontend build

RUN yarn workspace frontend focus --production && yarn cache clean

# app
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

CMD ["node","node_modules/.bin/next","start"]

