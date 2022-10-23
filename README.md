<h1>
<img width=42 height=42 src="https://i.imgur.com/HmWuIKF.png">&nbsp;&nbsp; nass
</h1>

## Client
```bash
npm i -g vite pnpm
pnpm i && vite build

# Linting
pnpm run lint
```

## Server
The container configurations should work with both Docker and Podman.

```bash
# Release
docker build --rm --tag=nass .
docker run -p 5678:5678 -d nass

# Development

# Start `watch` rebuild in Docker
./scripts/docker_dev.sh fullclean

# Tail application logs from the container
./scripts/docker_dev.sh logs

# Test endpoints, e.g.
curl -X POST -d "pass=jane" -L 'http://10.0.1.6:5678/get?path=Wallets/eth/main'|jq
curl -X GET -L 'http://10.0.1.6:5678/get?path=Wallets/eth/main'|jq


# Run server tests
go test -v --run $test_name ./server
```

## Related projects
<!-- `pass` itself is a shell script -->
* https://git.zx2c4.com/password-store
* https://github.com/BenoitZugmeyer/pass-web
