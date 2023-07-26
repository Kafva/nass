<h1>
<img width=42 height=42 src="./public/assets/icon.png">&nbsp;&nbsp; nass
</h1>

A mobile friendly web interface for pass,
*[the standard unix password manager](https://www.passwordstore.org/)*.

The application is designed to support multiple users, each with their own
subdirectory under `~/.password-store` and dedicated GPG key.
A single user mode is also supported, see [conf/nass.yml](conf/nass.yml).

Users are identified based on their source IP (i.e. no login prompt). The
service is designed to be accessible by a pre-defined set of users
(with one or more IPs assigned to them) in a Wireguard network, see
[conf/users.yml](conf/users.yml). Source IP spoofing should only be an issue if
a user has their Wireguard keys leaked.

## Deployment
The deployment steps are designed to be compatible with Alpine v3.16 on arm64,
other setups will require varying amounts of tweaking.

1. Create GPG keys for each user with [scripts/genkey.sh](/scripts/genkey.sh)
```bash
# Start a session with history tracking disabled
bash --init-file <(echo 'source ~/.bashrc; unset HISTFILE; set +o history')

./scripts/genkey.sh $name $email $master_password
```
and backup up the exported `./keys`.

2. Generate a `users.yml` configuration for the server and Wireguard
configurations with [scripts/genconf.sh](/scripts/genconf.sh),
output is placed under `./net`.
```bash
./scripts/genconf.sh $server_public_ip $user1 $user2 ...
```
Wireguard configurations can be distributed as QR codes to users:
```bash
qrencode -t ansiutf8 < net/wireguard/$user.cfg
```

3. Use [scripts/release.sh](/scripts/release.sh) to
  - Build the application in a container and extract the results.
  - Configure the environment of the deployment target with Ansible,
  see [roles/nass](roles/nass).
  - Sync the build and all configurations (including previously generated
  resources from `./keys` and `./net`) with the deployment target.
```bash
#                            [build]   [ansible]   [sync-app] [sync-config]
./scripts/release.sh $SERVER true      true        true       true  
```

4. Generate a self-signed certificate for the server (default: `CN=nass`)
  - Place the CA certificate at `/srv/nass/dist/ca.crt`
  - Place the server certificate and key under `/srv/nass/tls/server.{crt,key}`

5. As the nass application user, import each user's key:
```bash
./importkey.sh $username
```
6. Configure the server with a resolver (e.g. dnsmasq) that resolves nass to
the Wireguard address of the server.

7. Reboot the server and verify that the nass service starts up.

8. After importing their Wireguard configuration, each client should now be
able to access the service from [https://nass:5678](https://nass:5678).

9. The CA used for the self-signed certificate on the server can be
downloaded and installed from
[https://nass:5678/app/ca.crt](https://nass:5678/app/ca.crt)
(this must be done via _Safari_ to work on iOS).


## Development
The server is built with `go build` and the client is compiled with
```bash
yarn
pip install --user fonttools
./scripts/genfont.sh client && vite build
```

The [scripts/devctl.sh](scripts/devctl.sh) script provides a dummy environment
for development using Docker or Podman.
```bash
# The `watch` subcommand will build the Dockerfile.dev image
# (which is based of the main Dockerfile) and recompile the application
# whenever any source file changes.
./scripts/devctl.sh watch

# To test an endpoint, e.g.
curl -X GET -L 'http://$ALLOWED_IP:5678/get?path=visa' | jq
# the `conf/users.yml` needs to be modified to include your source
# IP as the origin of a user.
```

The test suites that exist mainly focus on input validation.
```bash
# Client tests
yarn run test

# Server tests
go test -v --run $test_name ./server
```

## Notes
* Functionality on mobile has only be tested to work as intended on recent
  versions of iOS with Safari and Brave.
* The generated subset font is not included into vite's build process, i.e. the
  warning `/app/assets/meslo-nass.ttf referenced in [...] didn't resolve at
  build time, it will remain unchanged to be resolved at runtime` triggered
  from `vite build` is intended.
* Overlapping directory and file names are __not__ supported, e.g. `/a/b.gpg`
  and `/a.gpg` are not allowed to exist at the same time.
* The [genconf.sh](/scripts/genconf.sh) script does not support generation of
  accounts with multiple origins, this needs to be manually configured.

## Similar projects
* https://github.com/mssun/passforios
* https://github.com/BenoitZugmeyer/pass-web
