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

WORKDIR /app

COPY --from=dist targets/ingester/package.json /app/ingester/package.json
COPY --from=dist targets/ingester/dist/ /app/ingester/dist/
COPY --from=dist targets/ingester/data/ /app/ingester/data
COPY --from=dist targets/ingester/node_modules/ /app/ingester/node_modules/
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "--cwd", "ingester", "start"]
