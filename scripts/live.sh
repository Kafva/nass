#!/usr/bin/env bash
# Restart the server whenever changes to source files are detected
CONF=${1:-conf/nass.yml}
USERS=${1:-conf/users.yml}

[ $(whoami) = root ] && # For Docker
    GO_FLAGS=(-buildvcs=false)

find . \
    -path ./dist -prune -o \
    -path ./node_modules -prune -o \
    -name "*.sh" -o -name "*.md" -o -name "*.go" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" \
    -o -name "*.html" -o -name "*.scss" -o -name "*.css" \
    -o -name "*.yml" -o -name "*.svelte" | entr -n -s \
    "echo 'Rebuilding...'; pkill -x nass; rm -rf dist && vite build &&
   go build ${GO_FLAGS[@]} && ./nass -c $CONF -u $USERS &"
