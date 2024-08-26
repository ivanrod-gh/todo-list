FROM node:20.13.1-alpine

ENV NODE_ROOT="/var/www/todo-list-general"
RUN mkdir -p $NODE_ROOT
WORKDIR $NODE_ROOT

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV="production"

EXPOSE 3000

CMD [ "node", "dist/main.js" ]