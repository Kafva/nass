FROM golang:alpine3.16

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

WORKDIR /nass
RUN apk add -U pass

USER nass

COPY ./server go.mod ./
RUN go build
ENTRYPOINT ["./nass"]

