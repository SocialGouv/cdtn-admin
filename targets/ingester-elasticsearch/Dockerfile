ARG NODE_VERSION=14.18.0-alpine3.11

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace ingester-es build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist targets/ingester-elasticsearch/package.json /app/
COPY --from=dist targets/ingester-elasticsearch/bin /app/bin/
COPY --from=dist targets/ingester-elasticsearch/dataset/suggestions.txt /app/dataset/

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "start"]
