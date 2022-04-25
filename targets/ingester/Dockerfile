<<<<<<< HEAD
ARG NODE_VERSION=14.18.0-alpine3.11

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace ingester build

# app
FROM node:$NODE_VERSION
=======
FROM node:14.18.1-alpine3.11
>>>>>>> master

WORKDIR /app

COPY --from=dist targets/ingester/package.json /app/
COPY --from=dist targets/ingester/dist/ /app/dist

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "start"]
