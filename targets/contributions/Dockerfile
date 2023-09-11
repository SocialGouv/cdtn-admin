ARG NODE_VERSION=14.21.3

FROM node:$NODE_VERSION AS dist

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch --immutable

ARG CDTN_API_URL
ENV CDTN_API_URL=$CDTN_API_URL

COPY shared/eslint-config /shared/eslint-config
COPY shared/graphql-client /shared/graphql-client
COPY targets/contributions /targets/contributions

RUN yarn workspace @shared/graphql-client build
RUN yarn workspace @socialgouv/contibutions build

RUN yarn workspace @socialgouv/contibutions focus --production && yarn cache clean

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist shared/graphql-client/package.json /app/shared/graphql-client/package.json
COPY --from=dist targets/contributions/package.json /app/targets/contributions/package.json
COPY --from=dist targets/contributions/next.config.js  /app/targets/contributions/next.config.js
COPY --from=dist targets/contributions/public /app/targets/contributions/public
COPY --from=dist targets/contributions/server /app/targets/contributions/server
COPY --from=dist targets/contributions/.next /app/targets/contributions/.next
COPY --from=dist targets/contributions/node_modules /app/targets/contributions/node_modules
COPY --from=dist package.json /app/package.json
COPY --from=dist node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/targets/contributions
CMD ["node", "./server"]
