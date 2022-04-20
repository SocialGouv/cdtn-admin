FROM node:14.18.3-slim

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown -R node:node /app
USER node

COPY yarn.lock /app/
# TODO: sync nodegit version with package.json
RUN yarn add nodegit --frozen-lockfile --pure-lockfile
RUN mkdir data

COPY targets/alert-cli/package.json /app/
COPY targets/alert-cli/dist/ /app/dist

ENV NODE_ENV=production

CMD ["yarn", "start"]
