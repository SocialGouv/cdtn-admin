ARG NODE_VERSION=14.18.0-slim

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

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

RUN npm i -g degit

RUN mkdir data

COPY --from=dist targets/alert-cli/package.json /app/alert-cli/package.json
COPY --from=dist targets/alert-cli/dist/ /app/alert-cli/dist/
COPY --from=dist targets/alert-cli/data/ /app/alert-cli/data
COPY --from=dist targets/alert-cli/node_modules/ /app/alert-cli/node_modules/
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "--cwd", "alert-cli", "start"]
