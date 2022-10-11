FROM golang:alpine3.16

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

RUN apk add -U pass git openssh

WORKDIR /nass
USER nass

COPY . .
RUN go get -u
RUN go build

ENTRYPOINT ["./nass"]

