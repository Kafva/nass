#!/usr/bin/env bash
CONTAINER=nass_dev
IMAGE=nass-dev

build_image(){
  docker images --format '{{.Repository}}'|rg -q "^nass$" ||
    docker build --rm --tag=nass .

  docker images --format '{{.Repository}}'|rg -q "^${IMAGE}$" ||
    docker build -f Dockerfile.dev --rm --tag=${IMAGE} .
}

case "$1" in
  *clean)
    containers=$(docker ps -a --format "{{.Image}} {{.Names}}" |
                 rg "^nass(-dev)* "|cut -f2 -d' ')

    docker rm ${containers} 2> /dev/null
    docker rmi ${IMAGE} 2> /dev/null
    [ "$1" = fullclean ] && 
      docker rmi nass 2> /dev/null
  ;;
  enter)
    build_image
    docker exec -it $CONTAINER /bin/bash
    exit
  ;;
esac

# [-t] is required to avoid immediate exit with [-d]
build_image

docker ps --format "{{.Names}}"|rg -q "^${CONTAINER}$" ||
  docker run -p 5678:5678 --name $CONTAINER -d -t --entrypoint /bin/bash ${IMAGE}

# We copy over files (instead of using a [-v] volume) for several reasons:
#   * Single files cannot be mounted and updated from the main host
#   since editors like vim create a new file (and thus a new inode)
#   * Everything in the volume becomes owned by root
#   * The main host recieves several files that should be kept on the guest
#   .ash_history, .gnupg etc.
#
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
    docker exec $CONTAINER go build
    docker exec $CONTAINER pkill -x nass
    docker exec $CONTAINER ./nass -c conf/nass.yml -u conf/users.yml
"





