ARG IMAGE_VERSION=0.27-20-alpine
ARG NODE_VERSION=20.2.0
# dist
FROM bitmeal/nodegit:$IMAGE_VERSION AS dist

WORKDIR /

COPY . /

RUN yarn --frozen-lockfile

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace @shared/dila-resolver build

RUN yarn workspace alert-cli build

# app
FROM node:$NODE_VERSION

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

RUN npm i -g degit

WORKDIR /app

RUN mkdir -p /app/alert-cli/data/

RUN chown node /app/alert-cli/data/

USER node

COPY --from=dist targets/alert-cli/package.json /app/alert-cli/package.json
COPY --from=dist targets/alert-cli/dist/ /app/alert-cli/dist/
COPY --from=dist targets/alert-cli/data/ /app/alert-cli/data
COPY --from=dist targets/alert-cli/node_modules/ /app/alert-cli/node_modules/
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

ENV NODE_ENV=production

CMD ["yarn", "--cwd", "alert-cli", "start"]
