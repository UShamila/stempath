FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads/cv uploads/certificates uploads/proofs uploads/avatars

EXPOSE 5000

CMD ["node", "server.js"]
