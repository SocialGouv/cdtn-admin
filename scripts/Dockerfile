FROM node:12.18.0-alpine3.11

RUN apk --no-cache add git

WORKDIR /app

COPY scripts/package.json /app/
COPY scripts/dist/ /app/dist

USER node

ENV NODE_ENV=production

CMD ["yarn", "start"]
