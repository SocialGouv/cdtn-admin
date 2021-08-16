FROM node:14.17.5-alpine3.11

WORKDIR /app

# data dir will hold downloaded tarballs
RUN mkdir data
COPY targets/ingester/package.json /app/
COPY targets/ingester/dist/ /app/dist

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

CMD ["yarn", "start"]
