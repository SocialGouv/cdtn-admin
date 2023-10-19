ARG NODE_VERSION=20.3.1-alpine

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY shared/eslint-config/package.json /shared/eslint-config/package.json
COPY shared/graphql-client/package.json /shared/graphql-client/package.json
COPY shared/id-generator/package.json /shared/id-generator/package.json
COPY shared/types/package.json /shared/types/package.json
COPY targets/frontend/package.json /targets/frontend/package.json
COPY package.json /package.json
COPY yarn.lock /yarn.lock

# hadolint ignore=SC2046
RUN yarn --frozen-lockfile

COPY . /

RUN yarn workspace @shared/types build

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace frontend build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist shared/id-generator/src /app/shared/id-generator/src
COPY --from=dist shared/id-generator/package.json /app/shared/id-generator/package.json
COPY --from=dist shared/types/build /app/shared/types/build
COPY --from=dist shared/types/package.json /app/shared/types/package.json
COPY --from=dist targets/frontend/package.json /app/targets/frontend/package.json
COPY --from=dist targets/frontend/next.config.js  /app/targets/frontend/next.config.js
COPY --from=dist targets/frontend/.env  /app/targets/frontend/.env
COPY --from=dist targets/frontend/public /app/targets/frontend/public
COPY --from=dist targets/frontend/.next /app/targets/frontend/.next
COPY --from=dist targets/frontend/node_modules /app/targets/frontend/node_modules
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "--cwd", "targets/frontend", "start"]

