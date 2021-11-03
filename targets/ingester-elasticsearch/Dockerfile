FROM node:14.18-alpine3.13 AS builder

USER node

WORKDIR /

RUN mkdir shared
RUN mkdir shared/elasticsearch-document-adapter
RUN echo `pwd`
RUN ls
RUN ls shared
COPY ../../shared/elasticsearch-document-adapter /shared/elasticsearch-document-adapter
RUN mkdirs targets/ingester-elasticsearch
COPY . /targets/ingester-elasticsearch
COPY package.json ./package.json

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM node:14.18-alpine3.13

WORKDIR /app

COPY --from=builder ./packages/ingester-elasticsearch/dataset/suggestions.txt /app/dataset/
COPY --from=builder ./package.json /app/
COPY --from=builder ./packages/ingester-elasticsearch/package.json /app/

ENV NODE_ENV=production

CMD ["yarn", "start"]
