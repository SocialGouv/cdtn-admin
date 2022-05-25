ARG NODE_VERSION=14.18.2-alpine

FROM node:$NODE_VERSION AS dist

WORKDIR /app

COPY shared/graphql-client/package.json /shared/graphql-client/package.json
COPY targets/contributions/package.json /targets/contributions/package.json
COPY package.json /package.json
COPY yarn.lock /yarn.lock

RUN yarn --frozen-lockfile

COPY . /

ENTRYPOINT ["yarn", "workspace", "@socialgouv/contibutions", "start:docker"]
