#!/usr/bin/env bash
# Cross compile for Alpine (arm64) and extract the results
die() { printf "$1\n" >&2 && exit 1; }
info() { printf "\033[34m>>>\033[0m $1\n" >&2; }
warn() { printf "\033[33mWARN\033[0m: $1\n" >&2; }
usage="usage: $(basename $0) <host> [build: bool] [ansible: bool] [sync-app: bool] [sync-config: bool]"
[[ -z "$2" || "$1" = '-h' ]] && die "$usage"



#==============================================================================#
BECOME_METHOD=doas
GOARCH=arm64
OUT=$GOARCH
TGZ=$OUT.tgz
IMAGE_NAME=nass_$GOARCH
APP_USER_HOME=/srv/nass
APP_USER=$(basename $APP_USER_HOME)
WG_IFACE=wg1
TARGET=$1
BUILD_STEP=${2:-false}
ANSIBLE_STEP=${3:-false}
SYNC_APP_STEP=${4:-false}
SYNC_USER_CFG_STEP=${5:-false}
#==============================================================================#

if $BUILD_STEP; then
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
fi

# The $OUT directory will be the home directory of the application
# user in deployment.
mkdir -p -m 700 $OUT/{.password-store,.gnupg,wireguard}

cp scripts/importkey.sh $OUT
git rev-parse --short HEAD > $OUT/VERSION
cp conf/gitconfig $OUT/.gitconfig
cp conf/gpg-agent.conf $OUT/.gnupg

if [[ -d ./net && -d ./keys ]]; then
    cp -r keys $OUT
    cp net/nass.yml $OUT/conf/nass.yml
    cp net/users.yml $OUT/conf
    cp net/wireguard/nass* $OUT/wireguard
else
    warn "missing ./net and/or ./keys"
fi

# Automatically fetch self-signed certs if available
if [ -d ~/.secret/selfsigned/nassca ]; then
    cp -v ~/.secret/selfsigned/nassca/nass.key $OUT/tls/server.key
    cp -v ~/.secret/selfsigned/nassca/nass.crt $OUT/tls/server.crt
    cp -v ~/.secret/ssl/nassca/certs/ca.crt $OUT/dist
fi

tar czf $TGZ $OUT

#==============================================================================#
if $ANSIBLE_STEP; then
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

if $SYNC_APP_STEP; then
    info "Sync application step"
    rsync $TGZ $TARGET:/tmp/$TGZ

    ssh -t $TARGET "$BECOME_METHOD -u $APP_USER \
      tar -xzf /tmp/$TGZ -o -m -C $APP_USER_HOME \
        --overwrite \
        --strip-components 1 \
        $OUT/nass \
        $OUT/VERSION \
        $OUT/dist \
        $OUT/importkey.sh \
        $OUT/.gitconfig \
        $OUT/.gnupg;
      rm /tmp/$TGZ
      "
    rm $TGZ
fi

if $SYNC_USER_CFG_STEP; then
    info "Sync user configuration step"
    rsync $TGZ $TARGET:/tmp/$TGZ

    ssh -t $TARGET "$BECOME_METHOD -u $APP_USER \
      tar -xzf /tmp/$TGZ -o -m -C $APP_USER_HOME \
        --overwrite \
        --strip-components 1 \
        $OUT/tls \
        $OUT/conf \
        $OUT/wireguard \
        $OUT/.password-store;
      rm /tmp/$TGZ

      $BECOME_METHOD cp $APP_USER_HOME/wireguard/nass.cfg \
        /etc/wireguard/$WG_IFACE.conf
      "
    rm $TGZ
fi
