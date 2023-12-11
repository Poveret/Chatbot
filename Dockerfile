FROM node:lts-iron

WORKDIR /app

COPY src/ ./src/
COPY .env ./
COPY package.json ./
COPY package-lock.json ./
COPY cliente/ ./cliente/

RUN npm run deploy

RUN npm install

CMD ["npm", "run", "start"]