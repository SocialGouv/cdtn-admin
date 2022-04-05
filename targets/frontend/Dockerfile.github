ARG NODE_VERSION=14.18.0-alpine3.11

# dist
FROM node:$NODE_VERSION AS dist

WORKDIR /

COPY shared/graphql-client/package.json /shared/graphql-client/
COPY shared/id-generator/package.json /shared/id-generator/
COPY shared/types/package.json /shared/types/
COPY targets/frontend/package.json /targets/frontend/
COPY package.json /
COPY yarn.lock /

RUN yarn --frozen-lockfile

COPY . /

RUN yarn workspace @shared/types build

RUN yarn workspace @shared/graphql-client build

RUN yarn workspace frontend build

# app
FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist shared/graphql-client/build /app/shared/graphql-client/build
COPY --from=dist shared/graphql-client/package.json /app/shared/graphql-client/
COPY --from=dist shared/id-generator/src /app/shared/id-generator/src
COPY --from=dist shared/id-generator/package.json /app/shared/id-generator/
COPY --from=dist shared/types/build /app/shared/graphql-client/build
COPY --from=dist shared/types/package.json /app/shared/graphql-client/
COPY --from=dist targets/frontend/package.json /app/targets/frontend/
COPY --from=dist targets/frontend/next.config.js  /app/targets/frontend/
COPY --from=dist targets/frontend/.env  /app/targets/frontend/
COPY --from=dist targets/frontend/public/ /app/targets/frontend/public
COPY --from=dist targets/frontend/.next/ /app/targets/frontend/.next
COPY --from=dist package.json /app/

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "--cwd", "targets/frontend", "start"]

