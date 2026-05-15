FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 3000

RUN npx prisma generate

RUN npm run build

CMD [ "npm", "run", "start" ]
