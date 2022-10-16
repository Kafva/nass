#!/usr/bin/env bash
USERS=(james jane)

# Create development keys
for u in ${USERS[@]}; do
  ./scripts/genkey.sh $u $u@kafva.one

  # Initalise password store with dummy data
  gpg --import keys/${u}.gpg
  KEYID=$(gpg --show-keys keys/${u}.gpg | grep "^ ")
  pass init --path="$HOME/.password-store/$u" $KEYID
done
