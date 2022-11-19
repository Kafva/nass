#!/usr/bin/env bash
: '''
Generate a users.yml along with a corresponding wireguard configurations.
Refer to the top level variables for configuration.
'''
die(){ printf "$1\n" >&2 ; exit 1; }
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }
err(){ printf "\033[31m!>\033[0m $1\n" >&2; }
check_deps(){
  for pkg in ${@}; do
    which $pkg &> /dev/null || die "Missing '$pkg'"
  done
}

usage="usage: $(basename $0) <nass public IP> <usernames ...>"
[ -z "$1" ] && die "$usage"

check_deps wg yq

#==============================================================================#

readonly NASS_PUBLIC_IP=$1
readonly WG_NET=10.0.77
readonly NASS_IP=$WG_NET.1

readonly OUTPUT=./out

#==============================================================================#

mkdir -p "$OUTPUT/wireguard"
printf '' > "$OUTPUT/users.yml"

i=100
for username in ${@:2}; do
  info $username
  # Generate key
  (umask 077; wg genkey > "$OUTPUT/wireguard/$username.key")

  # Add to users.yml
  printf "- name: $username\n  origins:\n    - $WG_NET.$i\n" >> \
    "$OUTPUT/users.yml"

  # Create wireguard config
cat << EOF > "$OUTPUT/wireguard/$username.cfg"

EOF

  i=$((i+1))
done


