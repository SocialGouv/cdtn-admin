ARG NODE_VERSION=20.3.1-alpine

# dist
FROM node:$NODE_VERSION AS dist

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn workspace frontend focus

COPY shared/graphql-client-build shared/graphql-client-build/
COPY targets/ingester targets/ingester/

RUN yarn workspace @shared/graphql-client build
RUN yarn workspace ingester build

RUN yarn workspace frontend focus --production && yarn cache clean

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist targets/ingester/package.json /app/package.json
COPY --from=dist targets/ingester/dist/ /app/dist/
COPY --from=dist node_modules /app/node_modules
COPY --from=dist targets/ingester/node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production

CMD ["node","--enable-source-maps","--unhandled-rejections=strict","dist/index.js"]
