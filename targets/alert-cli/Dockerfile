ARG NODE_VERSION=20.3.1-alpine

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace @shared/dila-resolver build

RUN yarn workspace alert-cli build

# app
FROM node:$NODE_VERSION

WORKDIR /app

USER node

COPY --from=dist targets/alert-cli/package.json /app/alert-cli/package.json
COPY --from=dist targets/alert-cli/dist/ /app/alert-cli/dist/
COPY --from=dist targets/alert-cli/node_modules/ /app/alert-cli/node_modules/
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

ENV NODE_ENV=production

CMD ["yarn", "--cwd", "alert-cli", "start"]
