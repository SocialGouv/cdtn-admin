FROM node:14.17-alpine3.13

USER node

WORKDIR /app

COPY ./dataset/suggestions.txt /app/dataset/
COPY ./package.json /app/
COPY ./bin/ /app/bin

ENV NODE_ENV=production

CMD ["yarn", "start"]
