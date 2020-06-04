FROM node:12.16.3-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --production --frozen-lockfile

COPY next.config.js  ./
COPY .env  ./.env
COPY .next/ ./.next
COPY public/ ./public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "start"]
