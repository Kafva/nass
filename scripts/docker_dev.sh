#!/usr/bin/env bash
if [ "$1" = clean ]; then
  containers=$(docker ps -a --format "{{.Image}} {{.Names}}" |
               rg "^nass(-dev)* "|cut -f2 -d' ')

  docker rm ${containers} 2> /dev/null
  docker rmi nass-dev 2> /dev/null
fi

docker images --format '{{.Repository}}'|rg -q "^nass$" ||
  docker build --rm --tag=nass .

docker images --format '{{.Repository}}'|rg -q "^nass-dev$" ||
  docker build -f Dockerfile.dev --rm --tag=nass-dev .


# Mounting the entire directory produces unnecessary files
# on the main host.
docker run -p 5678:5678 --name nass_dev -it --entrypoint /bin/bash \
  -v `pwd`/client:/root/client  \
  -v `pwd`/server:/root/server  \
  -v `pwd`/public:/root/public  \
  -v `pwd`/conf:/root/conf  \
  -v `pwd`/scripts:/root/scripts  \
  -v `pwd`/go.mod:/root/go.mod \
  -v `pwd`/go.sum:/root/go.sum \
  -v `pwd`/index.html:/root/index.html \
  -v `pwd`/main.go:/root/main.go \
  -v `pwd`/package.json:/root/package.json \
  -v `pwd`/svelte.config.js:/root/svelte.config.js \
  -v `pwd`/tsconfig.json:/root/tsconfig.json \
  -v `pwd`/tsconfig.node.json:/root/tsconfig.node.json \
  -v `pwd`/vite.config.ts:/root/vite.config.ts \
  nass-dev
