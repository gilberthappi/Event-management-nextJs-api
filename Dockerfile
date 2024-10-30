FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

EXPOSE 8904

RUN npx prisma generate
RUN npm run build
RUN npx prisma migration deploy
CMD ["npm", "start"]
