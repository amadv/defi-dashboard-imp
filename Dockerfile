FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run sql:setup

RUN npm run build

EXPOSE 3000

CMD npm start
