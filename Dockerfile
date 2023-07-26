FROM docker.io/alpine:3.18 as builder
ARG GOARCH

# Build dependencies
RUN apk add -U go git npm py3-fonttools bash

WORKDIR /nass

COPY . .
RUN go get -u
RUN GOARCH=${GOARCH} go build

# Create subset font (i.e. exclude unused glyphs)
RUN ./scripts/genfont.sh client

RUN npm i -g yarn vite
RUN yarn
RUN vite build

#============================================================================#
FROM docker.io/alpine:3.16 as nass

# `ARG` values are only available during the actual build
ENV CONF="conf/docker.yml"
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

# Create git repository for history tracking
RUN cp /nass/conf/gitconfig /nass/.gitconfig
RUN mkdir -m 700 /nass/.password-store
RUN pass git init

# Using the `[]` format will not expand environment variables
ENTRYPOINT ./nass -c "${CONF}" -u "${USERS}"
