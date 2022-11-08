#!/usr/bin/env bash
# To allow for local editing we run a rsync background process that
# syncs with the remote machine, which in turn syncs with the podman container
# that runs the application.

REMOTE=${1:-vel}
EXCLUDE=/tmp/excluded

cat << EOF > $EXCLUDE
dist
node_modules
.DS_Store
.cache
EOF

find . \
  -path ./dist -prune -o \
  -path ./.cache -prune -o \
  -path ./node_modules -prune -o \
  -name "*.sh" -o -name "*.md" -o -name "*.go" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" \
  -o -name "*.html" -o -name "*.scss" -o -name "*.css" \
  -o -name "*.yml" -o -name "*.svelte" |entr -n -s \
  "rsync --exclude-from=$EXCLUDE -r --delete ~/Repos/nass $REMOTE:~/Repos"


