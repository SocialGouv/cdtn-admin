FROM node:12.18.0-slim

RUN set -x \
  && apt-get update \
  && apt-get install --no-install-recommends --yes libgssapi-krb5-2 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock /app/
RUN yarn add nodegit --frozen-lockfile --pure-lockfile --cache-folder /dev/shm/yarn

COPY scripts/package.json /app/
COPY scripts/dist/ /app/dist

USER node

ENV NODE_ENV=production

CMD ["yarn", "start"]
