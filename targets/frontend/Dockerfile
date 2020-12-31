FROM node:15.5.0-alpine3.11

WORKDIR /app

COPY package.json yarn.lock /app/
COPY shared/graphql-client/src /app/shared/graphql-client/src
COPY shared/graphql-client/package.json /app/shared/graphql-client/
COPY shared/id-generator/src /app/shared/id-generator/src
COPY shared/id-generator/package.json /app/shared/id-generator/
COPY targets/frontend/package.json /app/targets/frontend/

RUN  npx @socialgouv/yarn-workspace-focus-install --cwd targets/frontend --production -- --cache-folder /dev/shm/yarn

COPY targets/frontend/next.config.js  /app/targets/frontend/
COPY targets/frontend/.env  /app/targets/frontend/
COPY targets/frontend/.next/ /app/targets/frontend/.next
COPY targets/frontend/public/ /app/targets/frontend/public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "--cwd", "targets/frontend", "start"]
