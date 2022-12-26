#!/usr/bin/env bash
die() { printf "\033[31m!>\033[0m $1\n" >&2 && exit 1; }

if [[ ! -f /.dockerenv && ! -f /run/.containerenv ]]; then
    printf "Not inside a container, run anyway? [y/N] "
    read ans
    [ "$ans" = y ] || exit 1
fi

USERS=(john jane)
PASSPHRASE_SUFFIX='$(hey)'

DB=(
    john/Wallets/btc/main
    john/Wallets/btc/frozen
    john/Wallets/eth/main
    john/Github/James0x1
    john/Github/James0x2
    john/Github/averylongnamethatcouldmessupformatting
    john/level1/level2/level3/level4
    john/level1/level2/tmp
    john/level1/tmp
    john/visa
    john/mastercard
    john/averylongnamethatcouldmessupformatting

    jane/Wallets/xmr/main
    jane/Wallets/xmr/frozen
    jane/Wallets/eth/main
    jane/Github/averylongnamethatcouldmessupformatting
    jane/level1/level2/level3/level4
    jane/level1/level2/tmp
    jane/level1/tmp
    jane/visa
    jane/mastercard
    jane/averylongnamethatcouldmessupformatting
)

# Create development keys
for u in ${USERS[@]}; do
    ./scripts/genkey.sh $u $u@kafva.one "$u${PASSPHRASE_SUFFIX}"
    ./scripts/importkey.sh "$u"
done

i=0
for entry in ${DB[@]}; do
    password="xd${i}"
    pass insert ${entry} < <(printf "$password\n$password\n")

    # Extra GPG options for pass
    export PASSPHRASE="$(cut -f1 -d/ <<< $entry)${PASSPHRASE_SUFFIX}"
    export PASSWORD_STORE_GPG_OPTS="--pinentry-mode loopback --passphrase $PASSPHRASE"
    plaintext=$(pass ${entry})

    [ "$password" = "$plaintext" ] ||
        die "Decryption error: '$password' != '$plaintext'"

    i=$((i + 1))
done

# Clean up sockets
rm -f /nass/.gnupg/S.*
