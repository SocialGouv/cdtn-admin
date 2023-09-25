ARG NODE_VERSION=14.21.3

FROM node:$NODE_VERSION AS deps

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# hadolint ignore=SC2046
RUN --mount=type=secret,id=npmTiptapToken,target=/secrets/npmTiptapToken \
  TIPTAP_AUTH_TOKEN=$(cat /secrets/npmTiptapToken) \
  yarn fetch workspaces focus @socialgouv/contibutions

FROM deps AS build-graphql-client
COPY shared/graphql-client ./shared/graphql-client
RUN yarn workspace @shared/graphql-client build

FROM deps as dist

COPY --from=build-graphql-client /app/shared/graphql-client /app/shared/graphql-client
COPY targets/contributions ./targets/contributions

ARG CDTN_API_URL
ENV CDTN_API_URL=$CDTN_API_URL
RUN yarn workspace @socialgouv/contibutions build

RUN yarn workspaces focus --production @socialgouv/contibutions  && yarn cache clean
RUN mkdir -p /app/targets/contributions/node_modules

FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist /app/shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist /app/shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist /app/targets/contributions/package.json /app/targets/contributions/package.json
COPY --from=dist /app/targets/contributions/next.config.js  /app/targets/contributions/next.config.js
COPY --from=dist /app/targets/contributions/public /app/targets/contributions/public
COPY --from=dist /app/targets/contributions/server /app/targets/contributions/server
COPY --from=dist /app/targets/contributions/.next /app/targets/contributions/.next
COPY --from=dist /app/targets/contributions/node_modules /app/targets/contributions/node_modules
COPY --from=dist /app/node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/targets/contributions
CMD ["yarn","start"]
