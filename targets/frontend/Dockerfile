FROM node:14.10.1-alpine3.11

WORKDIR /app

COPY package.json yarn.lock /app/
COPY shared/graphql-client/package.json /app/shared/graphql-client/
COPY shared/id-generator/package.json /app/shared/id-generator/
COPY targets/frontend/package.json /app/targets/frontend/

RUN  npx @socialgouv/yarn-workspace-focus-install --cwd shared/id-generator --cache-folder /dev/shm/yarn
RUN  npx @socialgouv/yarn-workspace-focus-install --cwd targets/frontend --production -- --cache-folder /dev/shm/yarn

COPY targets/frontend/next.config.js  /app/targets/frontend/
COPY targets/frontend/.env  /app/targets/frontend/
COPY targets/frontend/.next/ /app/targets/frontend/.next
COPY targets/frontend/public/ /app/targets/frontend/public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "--cwd", "targets/frontend", "start"]
