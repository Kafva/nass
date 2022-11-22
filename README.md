<h1>
<img width=42 height=42 src="./public/assets/icon.png">&nbsp;&nbsp; nass
</h1>

nass provides a mobile friendly web interface for pass, 
*[the standard unix password manager](https://www.passwordstore.org/)*.

The application is designed to support multiple users, each with their own 
subdirectory under `~/.password-store` and dedicated GPG key.

Users are identified based on their source IP (i.e. no login prompt). The 
service is designed to be accessible by a pre-defined set of users 
(with one or more IPs assigned to them) in a Wireguard network.
Source IP spoofing should only be an issue if a user has their Wireguard keys
leaked.

## Deployment
The deployment steps are designed to be compatible with Alpine v3.16 on arm64,
other setups will require varying amounts of tweaking.

1. Create keys for each user with [scripts/genkey.sh](/scripts/genkey.sh)
```bash
./scripts/genkey.sh "$name" "$email" "$master_password"
```
and backup up the exported `./keys`.

2. Generate a `users.yml` configuration for the server and Wireguard
configurations with [scripts/genconf.sh](/scripts/genconf.sh),
output is placed under `./net`.
```bash
./scripts/genconf.sh $server_public_ip $user1 $user2 ...
```
A Wireguard configuration will be created for each user, these can be
easily distributed as QR codes:
```bash
qrencode -t ansiutf8 < net/wireguard/$user.cfg
```

3. Use [scripts/release.sh](/scripts/release.sh) to
  - Build the application in a container
  - Setup a dedicated `nass` user and service on a remote server (Ansible)
  - Push the build and all configurations (including resources from `./keys` 
  and `./net`) to the remote server.
```bash
#                            [build]   [ansible]   [sync]
./scripts/release.sh $SERVER true      true        true
```

4. Generate a self-signed certificate for the server (default: `CN=nass`)
  - Place the CA certificate at `/srv/nass/dist/ca.crt`
  - Place the server certificate and key under `/srv/nass/tls/server.{crt,key}`

5. As the `nass` application user, import each user's key:
```bash
./importkey.sh $user1
...
```
6. Reboot to launch the `nass` service
7. Configure the server with a resolver (e.g. dnsmasq) that resolves `nass` to
the Wireguard address of the server.
8. After importing their Wireguard configuration, each client should now be
able to access the service from `https://nass:5678`.
9. The CA used for the self-signed certificate on the server can be
downloaded and installed from `https://nass:5678/app/ca.crt`
(this must be done via _Safari_ to work on iOS).


## Development

### Client
```bash
# Create subset font (i.e. exclude unused glyphs)
pip install --user fonttools
./scripts/genfont.sh client

npm i -g vite yarn
yarn && vite build

# Linting
yarn run lint

# Client tests
yarn run test
```

### Server
The container configurations should work with both Docker and Podman.
```bash
# The server itself can be built with
go build

# Start `watch` rebuild in Docker
./scripts/devctl.sh watch

# Test endpoints, e.g.
curl -X GET -L 'http://10.0.1.6:5678/get?path=Wallets/eth/main' | jq

# Run server tests
go test -v --run $test_name ./server
```

## Notes
* Overlapping directory and file names are __not__ supported, e.g. `/a/b.gpg`
and `/a.gpg` are not allowed to exist at the same time.

## Similar projects
* https://github.com/mssun/passforios
* https://github.com/BenoitZugmeyer/pass-web
