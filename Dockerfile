FROM golang:alpine3.16 as nass

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

RUN apk add -U pass gpg-agent git openssh

WORKDIR /nass
USER nass

COPY . .
RUN go get -u
RUN go build

ENTRYPOINT ["./nass"]

