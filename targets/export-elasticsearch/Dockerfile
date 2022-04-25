ARG NODE_VERSION=14.18.0-slim

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace @shared/types build

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace export-elasticsearch build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist targets/export-elasticsearch/package.json /app/
COPY --from=dist targets/export-elasticsearch/build/ /app/build

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "start"]
