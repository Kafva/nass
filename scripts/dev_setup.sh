#!/usr/bin/env bash
die(){ printf "\033[31m!>\033[0m $1\n" >&2 ; exit 1; }

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

# Maybe we need '> trust'

# Extra GPG options for pass
export PASSPHRASE=xd
export PASSWORD_STORE_GPG_OPTS="--pinentry-mode loopback --passphrase $PASSPHRASE"

# Create development keys
for u in ${USERS[@]}; do
  ./scripts/genkey.sh $u $u@kafva.one

  # Initalise password store with dummy data
  gpg --import keys/${u}.gpg
  KEYID=$(gpg --show-keys keys/${u}.gpg | grep "^ ")
  pass init --path="$u" $KEYID
done

for entry in ${DB[@]}; do
  password="xd${RANDOM}"
  pass insert ${entry} < <(printf "$password\n$password\n")

  plaintext=$(pass ${entry})
  [ "$password" = "$plaintext" ] ||
    die "Decryption error: '$password' != '$plaintext'"
done

: '''
Invocation that succeds if gpg-agent has the passphrase cached
  export PASSWORD_STORE_GPG_OPTS="--pinentry-mode error --no-tty"
  pass john/Github/James0x1

  gpg_agent:
  --no-allow-external-cache --default-cache-ttl 60

  gpg --output - --decrypt /root/.password-store/jane/Wallets/eth/main.gpg
'''

