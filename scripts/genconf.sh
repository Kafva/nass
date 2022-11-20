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
wg_gen() {
  local privkey="$OUTPUT/wireguard/$1.key"
  local pubkey="$OUTPUT/wireguard/$1.pub"
  (umask 077; wg genkey > "$privkey")
  wg pubkey < "$privkey" > "$pubkey"

  cat << EOF > "$OUTPUT/wireguard/$1.cfg"
[Interface]
PrivateKey = $(cat "$privkey")
Address = $2
ListenPort = $3
DNS = $WG_DNS

EOF

}

usage="usage: $(basename $0) <nass public IP> <usernames ...>"
[ -z "$1" ] && die "$usage"

check_deps wg

#==============================================================================#

readonly NASS_PUBLIC_IP=$1
readonly NASS_PUBLIC_PORT=51282
readonly WG_PORT=51280
readonly WG_NET=10.0.77
readonly NASS_IP=$WG_NET.1
readonly WG_DNS=$NASS_IP
readonly OUTPUT=./net

#==============================================================================#

mkdir -p "$OUTPUT/wireguard"
printf '' > "$OUTPUT/users.yml"

# == Wireguard configuration (server) ==
wg_gen nass $NASS_IP $NASS_PUBLIC_PORT

i=100
for username in ${@:2}; do
  wg_gen $username $WG_NET.$i $WG_PORT

  # Add to users.yml
  printf -- "- name: $username\n  origins:\n    - $WG_NET.$i\n" >> \
    "$OUTPUT/users.yml"

  # Append server to each user configuration
  cat << EOF >> "$OUTPUT/wireguard/$username.cfg"
[Peer] # nass
PublicKey = $(cat "$OUTPUT/wireguard/nass.pub")
Endpoint = $NASS_PUBLIC_IP:$WG_PORT
AllowedIPs = $NASS_IP/32
PersistentKeepalive = 25
EOF

  # Append each user tot the server configuration
  cat << EOF >> "$OUTPUT/wireguard/nass.cfg"
[Peer] # $username
PublicKey = $(cat "$OUTPUT/wireguard/$username.pub")
AllowedIPs = $WG_NET.$i/32
PersistentKeepalive = 25

EOF

  i=$((i+1))
done

tree $OUTPUT


