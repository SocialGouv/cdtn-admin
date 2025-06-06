ARG NODE_VERSION=22.13.1-alpine

FROM node:$NODE_VERSION AS deps

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# hadolint ignore=SC2046
RUN --mount=type=secret,id=NPM_TIPTAP_TOKEN,env=NPM_TIPTAP_TOKEN \
  yarn fetch workspaces focus frontend

FROM deps AS build-types
COPY shared/types ./shared/types/
RUN yarn workspace @socialgouv/cdtn-types build

FROM deps AS build-utils
COPY --from=build-types /app/shared/types /app/shared/types
COPY shared/utils ./shared/utils
RUN yarn workspace @shared/utils build

FROM deps as dist

ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT
ENV NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT=$NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT
ARG NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER
ENV NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER=$NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER
ARG NEXT_PUBLIC_BUCKET_DRAFT_FOLDER
ENV NEXT_PUBLIC_BUCKET_DRAFT_FOLDER=$NEXT_PUBLIC_BUCKET_DRAFT_FOLDER

COPY --from=build-types /app/shared/types /app/shared/types
COPY --from=build-utils /app/shared/utils /app/shared/utils
COPY shared/eslint-config ./shared/eslint-config/
COPY targets/frontend ./targets/frontend/

RUN yarn workspace frontend build

RUN yarn workspaces focus --production frontend && yarn cache clean
RUN mkdir -p targets/frontend/node_modules

FROM node:$NODE_VERSION

WORKDIR /app

COPY --from=dist /app/shared/utils/build /app/shared/utils/build
COPY --from=dist /app/shared/utils/package.json /app/shared/utils/package.json
COPY --from=dist /app/shared/types/build /app/shared/types/build
COPY --from=dist /app/shared/types/package.json /app/shared/types/package.json
COPY --from=dist /app/targets/frontend/package.json /app/targets/frontend/package.json
COPY --from=dist /app/targets/frontend/next.config.js  /app/targets/frontend/next.config.js
COPY --from=dist /app/targets/frontend/public /app/targets/frontend/public
COPY --from=dist /app/targets/frontend/.next /app/targets/frontend/.next
COPY --from=dist /app/targets/frontend/node_modules /app/targets/frontend/node_modules
COPY --from=dist /app/package.json /app/package.json
COPY --from=dist /app/node_modules /app/node_modules

USER 1000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/targets/frontend

CMD ["yarn","start"]

