ARG NODE_VERSION=24.10.0-alpine

FROM node:$NODE_VERSION AS deps

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# hadolint ignore=SC2046
RUN yarn fetch workspaces focus alert-cli

FROM deps AS build-types
COPY shared/types ./shared/types/
RUN yarn workspace @socialgouv/cdtn-types build

FROM deps AS build-utils
COPY --from=build-types /app/shared/types /app/shared/types
COPY shared/utils ./shared/utils
RUN yarn workspace @shared/utils build

FROM deps AS dist

COPY --from=build-utils /app/shared/utils /app/shared/utils
COPY --from=build-types /app/shared/types /app/shared/types

COPY targets/alert-cli ./targets/alert-cli

RUN yarn workspace alert-cli build

RUN yarn workspaces focus --production alert-cli && yarn cache clean


FROM node:$NODE_VERSION

# Add git to docker image
RUN apk add --no-cache git openssh-client

USER 1000

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dist /app/targets/alert-cli/dist ./dist/
COPY --from=dist /app/targets/alert-cli/package.json ./

CMD ["yarn","start"]
