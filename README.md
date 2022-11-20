<h1>
<img width=42 height=42 src="./public/assets/icon.png">&nbsp;&nbsp; nass
</h1>


## Deployment
1. Create a release build, the output is placed under `./arm64`
```bash
./scripts/release.sh
```

2. Create keys for each user with [scripts/genkey.sh](/scripts/genkey.sh)
```bash
./scripts/genkey.sh "$name" "$email" "$master_password"
```
and backup up the exported `./keys`.

3. Generate a `users.yml` configuration and Wireguard resources with
[scripts/genconf.sh](/scripts/genconf.sh)
```bash
./scripts/genconf.sh $(curl -s ifconfig.co) $user1 $user2 ...
```

4. Generate a self-signed certificate for the server
  - Place the CA certificate at `./arm64/dist/ca.crt`
  - Place the server certificate and key under `./arm64/tls/server.{crt,key}`

5. Modify the server configuration, `./arm64/conf/nass.yml`, if neccessary

6. Use the `nass` role to complete the setup.







---

## Client
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

## Server
The container configurations should work with both Docker and Podman.
```bash
# Release
docker build --rm --tag=nass .
docker run -p 5678:5678 -d nass

#== Development ==#
# Start `watch` rebuild in Docker
./scripts/docker_dev.sh fullclean

# Tail application logs from the container
./scripts/docker_dev.sh logs

# Test endpoints, e.g.
curl -X POST -d "pass=jane" -L 'http://10.0.1.6:5678/get?path=Wallets/eth/main'|jq
curl -X POST -d "pass=jane" -L 'http://10.0.1.6:5678/add?path=Wallets/eth/new'|jq
curl -X GET -L 'http://10.0.1.6:5678/get?path=Wallets/eth/main'|jq

#== Remote development ==#
# Yes, it is a bit overcomplicated...
(local)  ./scripts/remote.sh
(remote) ./scripts/docker_dev.sh watch
  (container) ./scripts/live.sh
(remote) ./scripts/docker_dev.sh logs


# Run server tests
go test -v --run $test_name ./server
```

## Notes
* Overlapping directory and file names are __not__ supported, e.g. `/a/b.gpg`
and `/a.gpg` are not allowed to exist at the same time.
