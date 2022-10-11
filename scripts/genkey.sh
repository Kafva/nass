#!/usr/bin/env bash
# Create a GPG key non-interactively for testing purposes
# Interactive creation:
#   gpg --full-generate-key
die(){ printf "$1\n" >&2 ; exit 1; }
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }
usage="usage: $(basename $0) <name> <email>"

[ -z "$2" ] && die "$usage"

NAME="$1"
EMAIL=$2
PASSPHRASE=xd
GPG_PARAMS=$(mktemp)

# Key-Type 1: RSA and RSA
# Subkey-Type 1:
# Expire-Date: 0  (does not expire)

cat << EOF > ${GPG_PARAMS}
Key-Type: 1
Key-Length: 4096
Subkey-Type: 1
Subkey-Length: 2048
Name-Real: "$NAME"
Name-Email: $EMAIL
Expire-Date: 0
EOF

gpg --batch --yes --pinentry-mode loopback \
  --passphrase "$PASSPHRASE" --gen-key ${GPG_PARAMS}

KEYID=$(gpg --list-keys|grep -B1 "$NAME <$EMAIL>"|head -n1)
gpg --export-secret-keys $KEYID > "$NAME.gpg"
info "Backed up secret key to '$NAME.gpg'"
