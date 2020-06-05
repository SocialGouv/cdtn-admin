FROM node:14.4-alpine3.11

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY next.config.js  ./
COPY .env  ./.env
COPY .next/ ./.next
COPY public/ ./public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "start"]
