FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run sql:gen

RUN chmod +x ./scripts/init-db.sh

RUN npm run build

EXPOSE 3000

CMD ./scripts/init-db.sh && npm start
