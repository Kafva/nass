#!/usr/bin/env bash
CONTAINER=nass_dev
IMAGE=nass-dev

die(){ printf "$1\n" >&2 ; exit 1; }

build_image(){
  docker images --format '{{.Repository}}'|rg -q "^nass$" ||
    docker build --rm --tag=nass .

  docker images --format '{{.Repository}}'|rg -q "^${IMAGE}$" ||
    docker build -f Dockerfile.dev --rm --tag=${IMAGE} .
}

watch_src(){
# [-t] is required to avoid immediate exit with [-d]
build_image
docker ps --format "{{.Names}}"|rg -q "^${CONTAINER}$" ||
  docker run -p 5678:5678 --name $CONTAINER -d -t ${IMAGE}

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
  -o -name "*.html" -o -name "*.scss" -o -name "*.css" \
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
    docker stop $CONTAINER
    docker start $CONTAINER
"
}

pgrep docker &> /dev/null || die "Docker daemon is not running"

case "$1" in
  *clean)
    containers=$(docker ps -a --format "{{.Image}} {{.Names}}" |
                 rg "^nass(-dev)* "|cut -f2 -d' ')

    docker rm ${containers} 2> /dev/null
    docker rmi ${IMAGE} 2> /dev/null
    [ "$1" = fullclean ] &&
      docker rmi nass 2> /dev/null
    watch_src
  ;;
  enter)
    build_image
    docker exec -it $CONTAINER /bin/bash
  ;;
  logs)
    while :; do
      sleep 0.5
      # The command exits when the container is restarted
      docker logs -f $CONTAINER
    done
  ;;
  watch)
    watch_src
  ;;
  *) die "usage: $(basename $0) <clean|enter|logs|watch>"
  ;;
esac


