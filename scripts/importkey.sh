#!/usr/bin/env bash
# Import a gpg key and initialize the password-store for a user.
die(){ printf "$1\n" >&2 ; exit 1; }
usage="usage: $(basename $0) <username>"
KEYDIR=arm64/keys
KEY=$KEYDIR/$1.gpg

[ -f "$KEY" ] || die "$usage"

gpg --import $KEY

KEYID=$(gpg --show-keys $KEY | grep "^ ")

pass init --path="${1}" $KEYID
