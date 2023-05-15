ARG NODE_VERSION=14.18.2-alpine

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace ingester build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist targets/ingester/package.json /app/package.json
COPY --from=dist targets/ingester/dist/ /app/dist/
COPY --from=dist node_modules /app/node_modules
COPY --from=dist targets/ingester/node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "start"]
