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
docker cp $container:/nass/dist $GOARCH

docker rm -v $container

# The arm64 directory will be the home directory of the application
# user in deployment.
mkdir -m 700 arm64/{.password-store,.gnupg}

cp -v conf/nass.yml       arm64/conf/nass.yml
cp -v conf/gitconfig      arm64/.gitconfig
cp -v conf/gpg-agent.conf arm64/.gnupg
