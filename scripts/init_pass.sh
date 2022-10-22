#!/usr/bin/env bash
die(){ printf "\033[31m!>\033[0m $1\n" >&2 ; exit 1; }

if [[ ! -f /.dockerenv && ! -f /run/.containerenv ]]; then
  printf "Not inside a container, run anyway? [y/N] "
  read ans
  [ "$ans" = y ] || exit 1
fi

USERS=(john jane)

DB=(
  john/Wallets/btc/main
  john/Wallets/btc/frozen
  john/Wallets/eth/main
  john/Github/James0x1
  john/Github/James0x2

  jane/Wallets/xmr/main
  jane/Wallets/xmr/frozen
  jane/Wallets/eth/main
  jane/Github/Jane0x1
  jane/Github/Jane0x2
)


# Create development keys
for u in ${USERS[@]}; do
  PASSPHRASE="${u}" ./scripts/genkey.sh $u $u@kafva.one

  # Initalise password store with dummy data
  gpg --import keys/${u}.gpg
  KEYID=$(gpg --show-keys keys/${u}.gpg | grep "^ ")
  pass init --path="$u" $KEYID
done

i=0
for entry in ${DB[@]}; do
  password="xd${i}"
  pass insert ${entry} < <(printf "$password\n$password\n")

  # Extra GPG options for pass
  export PASSPHRASE=$(cut -f1 -d/ <<< $entry)
  export PASSWORD_STORE_GPG_OPTS="--pinentry-mode loopback --passphrase $PASSPHRASE"
  plaintext=$(pass ${entry})

  [ "$password" = "$plaintext" ] ||
    die "Decryption error: '$password' != '$plaintext'"


  i=$((i+1))
done

# Clean up sockets
rm -f /nass/.gnupg/S.*
