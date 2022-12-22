#!/usr/bin/env bash
: '''
Verify that authentication requests from different origins are handled as
expected.

The tests should be ran on the same host that runs a `nass` container.
with the `docker.yml` user configuration as the target.
'''
info() { printf "\033[34m!>\033[0m $1" >&2; }
die() { cleanup && printf "$1\n" >&2 && exit 1; }

readonly IFACE=enp6s0
readonly NASS_IP=10.0.1.6
readonly JOHN_IP=10.0.1.77
readonly JANE_IP=10.0.1.66
readonly PASS_PATH="Wallets/eth/main"
CACHED_SEC=$(sed -nE 's/max-cache-ttl ([0-9]+)/\1/p' conf/gpg-agent.conf)
#WAIT_TIME=$((CACHED_SEC / 2))
WAIT_TIME=5

netstat -tunap 2> /dev/null | grep -q 5678 || die "Not listening on :5678"

cleanup() {
    sudo ip addr del $JOHN_IP/24 dev $IFACE
    sudo ip addr del $JANE_IP/24 dev $IFACE
}
success() { printf " \033[32m✓ \033[0m\n"; }

POST() {
    local res=$(curl -s --interface $1 -d "pass=$2" -X POST -L \
        "http://$NASS_IP:5678/get?path=$PASS_PATH" | jq -rM '.status')
    [ "$res" = "$3" ] || die "\nFailed 'POST $1 $2': got status: '$res'"
}
GET() {
    local res=$(curl -s --interface $1 -X GET -L \
        "http://$NASS_IP:5678/get?path=$PASS_PATH" | jq -rM '.status')
    [ "$res" = "$2" ] || die "\nFailed 'GET $1': got status: '$res'"
}

info "Root privileges are required to assign IPs\n"
sudo ip addr add $JOHN_IP/24 dev $IFACE
sudo ip addr add $JANE_IP/24 dev $IFACE

info "Authenticate successfully as John"
POST $JOHN_IP john success
success

info "Waiting for $WAIT_TIME sec...\n"
sleep $WAIT_TIME

info "John's request should NOT require re-authentication"
GET $JOHN_IP success
success

sleep 1

info "Jane's request should require authentication"
GET $JANE_IP retry
success

info "Authenticate as John and immediately try as Jane without authentication"
POST $JOHN_IP john success
GET $JANE_IP retry
GET $JANE_IP retry
POST $JANE_IP wrong failed
GET $JANE_IP retry
GET $JOHN_IP success
success

cleanup
echo "Done"
