FROM golang:alpine3.16

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

RUN apk add -U pass git

WORKDIR /nass
USER nass

COPY --chown=nass main.go ./server ./
COPY --chown=nass go.mod ./go.mod


RUN go get
RUN go build
RUN pass init

ENTRYPOINT ["./nass"]

