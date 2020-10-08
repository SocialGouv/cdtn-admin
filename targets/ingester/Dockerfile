FROM node:14.7.0-alpine3.11

WORKDIR /app

COPY package.json yarn.lock /app/
COPY shared/graphql-client/package.json /app/shared/graphql-client/
COPY targets/ingester/package.json /app/ingester/

RUN  npx @socialgouv/yarn-workspace-focus-install --cwd targets/ingester --production -- --cache-folder /dev/shm/yarn

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

CMD ["yarn", "workspace", "ingester","start"]
