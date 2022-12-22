#!/usr/bin/env bash
# Generate a users.yml along with corresponding Wireguard configurations.
die() {
    printf "$1\n" >&2
    exit 1
}
wg_gen() {
    local privkey="$OUTPUT/wireguard/$1.key"
    local pubkey="$OUTPUT/wireguard/$1.pub"
    (
        umask 077
        wg genkey > "$privkey"
    )
    wg pubkey < "$privkey" > "$pubkey"

    cat << EOF > "$OUTPUT/wireguard/$1.cfg"
[Interface]
PrivateKey = $(cat "$privkey")
Address = $2
ListenPort = $WG_PORT
EOF

    # Only set DNS for clients
    # The PostUp directive is not supported for iOS clients
    if [ "$3" = client ]; then
        printf "DNS = $WG_DNS\n" >> "$OUTPUT/wireguard/$1.cfg"
    fi
    echo >> "$OUTPUT/wireguard/$1.cfg"

}

usage="usage: $(basename $0) <nass public IP> <usernames ...>"
[ -z "$1" ] && die "$usage"

#==============================================================================#

# We use a non-standard WG port to avoid collisions with existing networks
readonly NASS_PUBLIC_IP=$1
readonly WG_PORT=51285
readonly WG_NET=10.0.77
readonly NASS_IP=$WG_NET.1
readonly WG_DNS=$NASS_IP
readonly OUTPUT=./net

#==============================================================================#

mkdir -p "$OUTPUT/wireguard"
printf '' > "$OUTPUT/users.yml"

# == Application config ==
cat << EOF > $OUTPUT/nass.yml
bind_address: $NASS_IP
port: 5678
password_store: ~/.password-store

debug: true
color: true

single_user: false
tls_enabled: true
tls_cert: tls/server.crt
tls_key: tls/server.key
EOF

# == Wireguard configuration (server) ==
wg_gen nass $NASS_IP server

i=100
for username in ${@:2}; do
    wg_gen $username $WG_NET.$i client

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

    # Append each user to the server configuration
    cat << EOF >> "$OUTPUT/wireguard/nass.cfg"
[Peer] # $username
PublicKey = $(cat "$OUTPUT/wireguard/$username.pub")
AllowedIPs = $WG_NET.$i/32
PersistentKeepalive = 25

EOF

    i=$((i + 1))
done

tree $OUTPUT
