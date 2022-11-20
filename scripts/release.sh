#!/usr/bin/env bash
# Cross compile for Alpine (arm64) and extract the results
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }
GOARCH=arm64
OUT=$GOARCH
NAME=nass_$GOARCH

rm -rf $OUT

docker rmi $NAME
docker build --rm --tag=$NAME --build-arg GOARCH=$GOARCH .
container=$(docker create $NAME)

mkdir -p $OUT/{conf,tls}

# Extract build results
docker cp $container:/nass/nass $OUT/nass
docker cp $container:/nass/dist $OUT
docker rm $container

# The $OUT directory will be the home directory of the application
# user in deployment.
mkdir -m 700 $OUT/{.password-store,.gnupg,wireguard}

cp -v net/nass.yml           $OUT/conf/nass.yml
cp -v net/users.yml          $OUT/conf
cp -v conf/gitconfig         $OUT/.gitconfig
cp -v conf/gpg-agent.conf    $OUT/.gnupg
cp -rv keys                  $OUT
cp -v net/wireguard/nass*    $OUT/wireguard
cp -v scripts/importkey.sh   $OUT


# Automatically fetch self-signed certs if available
if [ -d ~/.secret/selfsigned/nassca ]; then
  cp -v ~/.secret/selfsigned/nassca/nass.key $OUT/tls/server.key
  cp -v ~/.secret/selfsigned/nassca/nass.crt $OUT/tls/server.crt
  cp -v ~/.secret/ssl/nassca/certs/ca.crt    $OUT/dist
fi
