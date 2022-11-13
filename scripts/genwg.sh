#!/usr/bin/env bash
: '''
Generate wireguard configurations and keys based on a users.yml file.
'''
die(){ printf "$1\n" >&2 ; exit 1; }
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }
err(){ printf "\033[31m!>\033[0m $1\n" >&2; }
usage="usage: $(basename $0) <users.yml>"

[ -f "$1" ] || die "$usage"


