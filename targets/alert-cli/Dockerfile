ARG NODE_VERSION=14.18.0-slim

# dist
FROM node:$NODE_VERSION AS dist

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace @shared/dila-resolver build

RUN yarn workspace alert-cli build

# app
FROM node:$NODE_VERSION

WORKDIR /app

RUN npm i -g degit

COPY --from=dist targets/alert-cli/package.json /app/
COPY --from=dist targets/alert-cli/dist/ /app/dist
COPY --from=dist targets/alert-cli/data/ /app/data

USER 1000

ENV NODE_ENV=production

CMD ["yarn", "start"]
