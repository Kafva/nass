FROM golang:alpine3.16

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

WORKDIR /nass
RUN apk add -U pass

USER nass

COPY main.go go.mod ./server ./
RUN go build
ENTRYPOINT ["./nass"]

