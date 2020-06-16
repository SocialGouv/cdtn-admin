FROM node:12.18.0-alpine3.11

WORKDIR /app

COPY package.json yarn.lock /app/
COPY @cdtn-admin/infra/package.json /app/@cdtn-admin/infra/
COPY targets/www/package.json /app/targets/www/

RUN  npx @socialgouv/yarn-workspace-focus-install --cwd targets/www --production  --cache-folder /dev/shm/yarn

COPY .env targets/www/next.config.js  /app/
COPY targets/www/.next/ /app/targets/www/.next
COPY targets/www/public/ /app/targets/www/public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "--cwd", "targets/www", "start"]
