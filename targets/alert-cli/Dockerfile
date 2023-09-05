ARG NODE_VERSION=20.3.1-alpine

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch --immutable

COPY shared/graphql-client ./shared/graphql-client
COPY shared/dila-resolver ./shared/dila-resolver
COPY shared/types ./shared/types

RUN yarn workspace @shared/graphql-client build
RUN yarn workspace @shared/dila-resolver build
RUN yarn workspace alert-cli build

# app
FROM node:$NODE_VERSION

# Add git to docker image
RUN apk add --no-cache git openssh-client

WORKDIR /app

USER 1000

COPY --from=dist targets/alert-cli/package.json /app/alert-cli/package.json
COPY --from=dist targets/alert-cli/dist/ /app/alert-cli/dist/
COPY --from=dist targets/alert-cli/node_modules/ /app/alert-cli/node_modules/
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

ENV NODE_ENV=production

CMD ["node","--enable-source-maps","--unhandled-rejections=strict","./dist/index.js"]
