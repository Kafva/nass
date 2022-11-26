#!/usr/bin/env bash
retab(){
  : ''' Trim trailing whitespace and translate tabs to 2 spaces '''
  [ -z "$1" ] && {
    echo "${funcstack[1]}${FUNCNAME[0]} <files ...>" >&2
    return 1
  }
  for f in $@; do
    [ -f "$f" ] || continue
    sed -i'.rm' -E 's/\t/  /g' "$f"; rm -f "$f.rm"
    sed -i'.rm' -E 's/ +$//g'  "$f"; rm -f "$f.rm"
  done
}

retab server/*.go client/{components/*.svelte,ts/*.ts,scss/*.scss,tests/*.ts} \
  conf/* roles/nass/tasks/*.yml index.html Dockerfile* main.go README.md \
  *.js *.cjs go.mod *.json scripts/*.sh

eslint client/{ts,components,tests}
