#!/usr/bin/env bash
# Cross compile for Alpine (arm64) and extract the results
die(){ printf "$1\n" >&2 ; exit 1; }
info(){ printf "\033[34m>>>\033[0m $1\n" >&2; }
usage="usage: $(basename $0) <host> [build: bool] [ansible: bool] [sync: bool]"
[[ -z "$2" || "$1" = '-h' ]] && die "$usage"

#==============================================================================#
BECOME_METHOD=doas
GOARCH=arm64
OUT=$GOARCH
TGZ=$OUT.tgz
IMAGE_NAME=nass_$GOARCH
APP_USER_HOME=/srv/nass
APP_USER=$(basename $APP_USER_HOME)
TARGET=$1
#==============================================================================#

if ${2:-false}; then
  info "Build step"
  rm -rf $OUT

  docker rmi $IMAGE_NAME
  docker build --rm --tag=$IMAGE_NAME --build-arg GOARCH=$GOARCH .
  container=$(docker create $IMAGE_NAME)

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
fi

#==============================================================================#
if ${3:-false}; then
  info "Ansible step"
  cat << EOF > /tmp/$TARGET.yml
---
- name: Nass server setup
  hosts: $TARGET
  become_method: $BECOME_METHOD
  roles:
    - { role: nass }
EOF
  ansible-playbook /tmp/$TARGET.yml
fi

#==============================================================================#
if ${4:-false}; then
  info "Sync step"
  tar czf $TGZ $OUT
  rsync $TGZ $TARGET:/tmp/$TGZ

  ssh -t $TARGET "doas -u $APP_USER \
    tar -xzf /tmp/$TGZ -o -m -C $APP_USER_HOME --overwrite \
      --strip-components 1; \
    rm /tmp/$TGZ"

  rm $TGZ
fi
