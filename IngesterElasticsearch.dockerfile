FROM node:14.18-alpine3.13 AS builder

WORKDIR /

RUN mkdir shared
COPY ./shared/elasticsearch-document-adapter /shared/elasticsearch-document-adapter
COPY ./shared/elasticsearch /shared/elasticsearch
RUN mkdir targets
COPY ./targets/ingester-elasticsearch /targets/ingester-elasticsearch
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM node:14.18-alpine3.13

WORKDIR /app

COPY --from=builder ./targets/ingester-elasticsearch/dataset/suggestions.txt /app/dataset/
COPY --from=builder ./package.json /app/
COPY --from=builder ./targets/ingester-elasticsearch/package.json /app/

ENV NODE_ENV=production

CMD ["yarn", "start"]
