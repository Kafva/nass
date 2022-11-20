#!/usr/bin/env bash
# Cross compile for Alpine (arm64) and extract the results
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }
GOARCH=arm64
NAME=nass_$GOARCH

docker build --rm --tag=$NAME --build-arg GOARCH=$GOARCH .
container=$(docker create $NAME)

mkdir -p $GOARCH/{conf,tls}

# Extract build results
docker cp $container:/nass/nass $GOARCH/nass
docker cp $container:/nass/dist $GOARCH/dist

docker rm -v $container
