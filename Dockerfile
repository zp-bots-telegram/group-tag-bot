FROM node:20.9.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn install --immutable
RUN yarn run build

FROM node:20.9.0-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY --from=0 /usr/src/app/dist/* ./
CMD npx prisma migrate deploy && node bundle.js