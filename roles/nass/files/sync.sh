#!/usr/bin/env bash
die(){ printf "$1\n" >&2 ; exit 1; }
[[ -z "$2" || "$1" = '-h' ]] && 
  die "usage: $(basename $0) <host> <app user \$HOME>"

OUT=arm64
TGZ=$OUT.tgz

tar czf $TGZ $OUT 

rsync $TGZ $1:/tmp/$TGZ

APP_USER=$(basename $2)
ssh -t $1 "doas -u $APP_USER 
  tar -xzf /tmp/$TGZ -o -m -C $2 --overwrite --strip-components 1"

rm $TGZ
