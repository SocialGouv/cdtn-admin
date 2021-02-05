FROM node:14.15.4-alpine3.11

USER node

WORKDIR /app

COPY targets/ingester-es/dataset/suggestions.txt /app/dataset/
COPY targets/ingester-es/package.json /app/
COPY targets/ingester-es/dist/ /app/dist

ENV NODE_ENV=production

CMD ["yarn", "start"]
