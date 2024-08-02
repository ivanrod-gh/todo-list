FROM golang:1.22.5-alpine3.20

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

# COPY *.go ./
# COPY .env.development .env.production ./
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o go-ms ./cmd

ENV GO_ENV="production"

CMD ["./go-ms"]

# ENV NODE_ROOT="/var/www/node-server07-general"
# RUN mkdir -p $NODE_ROOT
# WORKDIR $NODE_ROOT

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# ENV NODE_ENV="production"

# EXPOSE 3000

# CMD [ "node", "dist/main.js" ]