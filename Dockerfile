FROM golang:alpine3.16 as builder

# Build dependencies
RUN apk add -U git npm

WORKDIR /nass

COPY . .
RUN go get -u
RUN go build

RUN npm i -g pnpm vite
RUN pnpm i
RUN vite build

#============================================================================#
FROM alpine:3.16 as nass
ARG CONF="conf/nass.yml"
ARG USERS="conf/users.yml"

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

# Runtime dependencies
RUN apk add -U pass gpg-agent git

WORKDIR /nass
USER nass
COPY --from=builder --chown=nass /nass .

ENTRYPOINT ["./nass", "-c", "${CONF}", "-u", "${USERS}"]


