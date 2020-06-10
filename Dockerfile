FROM node:14.4-alpine3.11

WORKDIR /app

COPY package.json yarn.lock ./

RUN apk add --no-cache build-base libgit2-dev python --virtual .build-deps \
  && ln -s /usr/lib/libcurl.so.4 /usr/lib/libcurl-gnutls.so.4 \
  && yarn --production --frozen-lockfile \
  && apk del .build-deps

COPY next.config.js  ./
COPY .env  ./.env
COPY .next/ ./.next
COPY public/ ./public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "start"]
