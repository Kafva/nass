FROM docker.io/golang:alpine3.16 as builder

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
FROM docker.io/alpine:3.16 as nass

# `ARG` values are only available during the actual build
ENV CONF="conf/nass.yml"
ENV USERS="conf/users.yml"

RUN adduser \
  --disabled-password --gecos "" \
  --home "/nass" --uid "6000" \
  nass

# Runtime dependencies
RUN apk add -U pass gpg-agent git

WORKDIR /nass
USER nass
COPY --from=builder --chown=nass /nass .

RUN mkdir -m 700 /nass/.gnupg
RUN cp /nass/conf/gpg-agent.conf /nass/.gnupg

# Using the `[]` format will not expand environment variables
ENTRYPOINT ./nass -c "${CONF}" -u "${USERS}"
