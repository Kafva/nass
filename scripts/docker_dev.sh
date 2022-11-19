#!/usr/bin/env bash
CONTAINER=nass_dev
IMAGE=nass-dev

die(){ printf "$1\n" >&2 ; exit 1; }

build_image(){
  docker images --format '{{.Repository}}'|rg -q "^(localhost/)?nass$" ||
    docker build --rm --tag=nass .

  docker images --format '{{.Repository}}'|rg -q "^(localhost/)?${IMAGE}$" ||
    docker build -f Dockerfile.dev --rm --tag=${IMAGE} .
}

watch_src(){
# [-t] is required to avoid immediate exit with [-d]
build_image

local container_args=(
  -p 5678:5678 --name $CONTAINER -d -t ${IMAGE}
)

if ! docker ps --format "{{.Names}}"|rg -q "^${CONTAINER}$"; then
  if which podman &> /dev/null; then
    # For source IPs to be preserved in incoming requests we need an
    # extra option in podman
    podman run --net slirp4netns:port_handler=slirp4netns ${container_args[@]}
  else
    docker run ${container_args[@]}
  fi
fi

trap cleanup SIGINT

# We copy over files (instead of using a [-v] volume) for several reasons:
#   * Single files cannot be mounted and updated from the main host
#   since editors like vim create a new file (and thus a new inode)
#   * Everything in the volume becomes owned by root
#   * The main host receives several files that should be kept on the guest
#   .ash_history, .gnupg etc.
#

# On change to source files on the host:
#   Copy over all source files to the guest
#   Rebuild
#   Restart from default --entrypoint
# View logs from separate terminal
find . \
  -path ./dist -prune -o \
  -path ./node_modules -prune -o \
  -name "*.go" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" \
  -o -name "*.html" -o -name "*.scss" -o -name "*.css" -o -name "*.ttf" \
  -o -name "*.yml" -o -name "*.svelte" |entr -n -s "
    docker cp main.go    $CONTAINER:/nass/ 2> /dev/null
    docker cp index.html $CONTAINER:/nass/ 2> /dev/null
    docker cp client $CONTAINER:/nass/ 2> /dev/null
    docker cp server $CONTAINER:/nass/ 2> /dev/null
    docker cp public $CONTAINER:/nass/ 2> /dev/null
    docker cp conf $CONTAINER:/nass/ 2> /dev/null
    docker cp scripts $CONTAINER:/nass/ 2> /dev/null
    docker exec -u root $CONTAINER chown -R nass:nass /nass
    docker exec $CONTAINER go build
    docker exec $CONTAINER vite build
    docker stop $CONTAINER
    docker start $CONTAINER
"
}

cleanup(){
  pkill -x entr
  docker stop $CONTAINER
  docker rm $CONTAINER
  exit $?
}

#==============================================================================#

if which podman &> /dev/null; then
  podman_opts=(--external)
else
  pgrep docker &> /dev/null || die "Docker daemon is not running"
fi

case "$1" in
  *clean)
    containers=$(docker ps -a ${podman_opts[@]} \
      --format "{{.Image}} {{.Names}}" |
      rg "^(localhost/)?nass(-dev)* "|cut -f2 -d' ')

    docker rm -f ${containers} 2> /dev/null
    docker rmi ${IMAGE}

    [ "$1" = fullclean ] && docker rmi nass
    build_image
  ;;
  enter)
    build_image
    docker exec -it $CONTAINER ${2:-/bin/bash}
  ;;
  log*)
    docker ps --format "{{.Names}}"|grep -q "^$CONTAINER$" ||
      die "Not running: $CONTAINER"

    trap exit SIGINT

    while :; do
      sleep 0.5
      # The command exits when the container is restarted
      if which podman &> /dev/null; then
        podman logs --tail 10 --follow $CONTAINER
      else
        docker logs -f $CONTAINER
      fi
    done
  ;;
  watch)
    watch_src
  ;;
  *) die "usage: $(basename $0) <fullclean|clean|enter|logs|watch>"
  ;;
esac


