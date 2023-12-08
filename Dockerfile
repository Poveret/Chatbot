FROM node:lts-iron

WORKDIR /app

COPY public/ ./public/
COPY src/ ./src/
COPY .env ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install

CMD ["npm", "run", "start"]