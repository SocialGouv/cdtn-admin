ARG NODE_VERSION=20.3.1-alpine

FROM node:$NODE_VERSION AS deps

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus alert-cli

FROM deps AS build-graphql-client
COPY shared/graphql-client ./shared/graphql-client
RUN yarn workspace @shared/graphql-client build


FROM deps AS build-dila-resolver
COPY shared/types ./shared/types
COPY shared/dila-resolver ./shared/dila-resolver
RUN yarn workspace @shared/dila-resolver build

FROM deps AS dist

COPY --from=build-graphql-client /app/shared/graphql-client /app/shared/graphql-client
COPY --from=build-dila-resolver /app/shared/dila-resolver /app/shared/dila-resolver

COPY shared/types ./shared/types
COPY targets/alert-cli ./targets/alert-cli
COPY tsconfig.build.json ./

RUN yarn workspace alert-cli build

RUN yarn workspaces focus --production alert-cli && yarn cache clean


FROM node:$NODE_VERSION

# Add git to docker image
RUN apk add --no-cache git openssh-client

USER 1000

ENV NODE_ENV=production

WORKDIR /app/targets/alert-cli

COPY --from=dist /app/targets/alert-cli/dist ./dist

CMD ["node","--enable-source-maps","--unhandled-rejections=strict","./dist/index.js"]
