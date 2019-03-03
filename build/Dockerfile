FROM node:10-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install --production
RUN npm run build

CMD ["node", "dist/app.js"]
