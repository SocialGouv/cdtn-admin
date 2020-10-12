FROM node:14.7.0-alpine3.11

WORKDIR /app

# data dir will hold downloaded tarballs
RUN mkdir data
COPY targets/alert-cli/package.json /app/
COPY targets/alert-cli/dist/ /app/dist

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

CMD ["yarn", "workspace", "ingester", "start"]
