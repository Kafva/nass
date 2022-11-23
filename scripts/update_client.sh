#!/usr/bin/env bash
HST=${1:-aly}
vite build
rsync -r --delete ./dist $HST:/tmp
ssh -t $HST \
  "doas -u nass rsync -r --delete --exclude=ca.crt /tmp/dist /srv/nass"

