FROM golang:1.22.5-alpine3.20

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o go-ms ./cmd

ENV GO_ENV="production"

CMD ["./go-ms"]
