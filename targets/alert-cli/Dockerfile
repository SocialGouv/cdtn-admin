FROM node:12.18.1-slim

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown -R node:node /app
USER node

COPY yarn.lock /app/
# TODO: sync nodegit version with package.json
RUN yarn add nodegit --frozen-lockfile --pure-lockfile --cache-folder /dev/shm/yarn

COPY targets/alert-cli/package.json /app/
COPY targets/alert-cli/dist/ /app/dist

ENV NODE_ENV=production

CMD ["yarn", "start"]
