#!/usr/bin/env bash
HST=${1:-aly}
vite build
git rev-parse --short HEAD > ./dist/VERSION
rsync -r --delete ./dist $HST:/tmp
ssh -t $HST \
    "doas -u nass rsync -r --delete --exclude=ca.crt /tmp/dist /srv/nass &&
   doas -u nass mv -v /srv/nass/dist/VERSION /srv/nass/VERSION"
