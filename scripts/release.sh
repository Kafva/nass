#!/usr/bin/env bash
# Cross compile for Alpine (arm64) and extract the results
die() { printf "$1\n" >&2 && exit 1; }
info() { printf "\033[34m>>>\033[0m $1\n" >&2; }
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
WG_IFACE=wg1
TARGET=$1
BUILD_STEP=${2:-false}
ANSIBLE_STEP=${3:-false}
SYNC_STEP=${4:-false}
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

[ -d ./net ] || die "Stopping... missing ./net"

# The $OUT directory will be the home directory of the application
# user in deployment.
mkdir -p -m 700 $OUT/{.password-store,.gnupg,wireguard}

cp net/nass.yml $OUT/conf/nass.yml
cp net/users.yml $OUT/conf
cp conf/gitconfig $OUT/.gitconfig
cp conf/gpg-agent.conf $OUT/.gnupg
cp -r keys $OUT
cp net/wireguard/nass* $OUT/wireguard
cp scripts/importkey.sh $OUT
git rev-parse --short HEAD > $OUT/VERSION

# Automatically fetch self-signed certs if available
if [ -d ~/.secret/selfsigned/nassca ]; then
    cp -v ~/.secret/selfsigned/nassca/nass.key $OUT/tls/server.key
    cp -v ~/.secret/selfsigned/nassca/nass.crt $OUT/tls/server.crt
    cp -v ~/.secret/ssl/nassca/certs/ca.crt $OUT/dist
fi

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
if $SYNC_STEP; then
    info "Sync step"
    tar czf $TGZ $OUT
    rsync $TGZ $TARGET:/tmp/$TGZ

    # Update all application files and the wg interface configuration.
    # If ./genconf.sh is re-ran (with the same input), it is enough
    # to re-run the sync step for things to work.
    ssh -t $TARGET "$BECOME_METHOD -u $APP_USER \
    tar -xzf /tmp/$TGZ -o -m -C $APP_USER_HOME --overwrite \
      --strip-components 1; \
      rm /tmp/$TGZ
      $BECOME_METHOD cp $APP_USER_HOME/wireguard/nass.cfg \
        /etc/wireguard/$WG_IFACE.conf
      "
    rm $TGZ
fi
