ARG NODE_VERSION=20.3.1-alpine

FROM node:$NODE_VERSION AS deps

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# hadolint ignore=SC2046
RUN yarn fetch workspaces focus ingester

FROM deps AS build-graphql-client
COPY shared/graphql-client ./shared/graphql-client
RUN yarn workspace @shared/graphql-client build

FROM deps AS build-types
COPY shared/types ./shared/types
RUN yarn workspace @shared/types build

FROM deps AS build-utils
COPY shared/utils ./shared/utils
RUN yarn workspace @shared/utils build

FROM deps as dist
COPY --from=build-graphql-client /app/shared/graphql-client /app/shared/graphql-client
COPY --from=build-types /app/shared/types /app/shared/types
COPY --from=build-utils /app/shared/utils /app/shared/utils
COPY targets/ingester targets/ingester
COPY tsconfig.build.json .

RUN yarn workspace ingester build

RUN yarn workspaces focus --production ingester && yarn cache clean


FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist /app/targets/ingester/dist/ /app/dist/
COPY --from=dist /app/targets/ingester/package.json /app/

USER 1000

ENV NODE_ENV=production

CMD ["yarn","start"]
