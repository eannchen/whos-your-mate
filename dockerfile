FROM golang:1.22.4-alpine3.20 AS builder

WORKDIR /app

COPY . .

RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -o app

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/app .
COPY static static
COPY images images

CMD ls -al && ./app
EXPOSE 80