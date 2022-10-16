#!/usr/bin/env bash
USERS=(jane james jonas)

# Create development keys
for u in ${USERS[@]}; do
  ./scripts/genkey.sh $u $u@kafva.one
  # pass init for each one
done
