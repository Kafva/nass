<h1>
<img width=42 height=42 src="https://i.imgur.com/HmWuIKF.png">&nbsp;&nbsp; nass
</h1>

## Client
```bash
npm i -g vite pnpm
pnpm i && vite build
```

## Server

```bash
# Release
docker build --rm --tag=nass .
docker run -p 5678:5678 -d nass

# Development
docker build --rm --tag=nass .
docker build -f Dockerfile.dev --rm --tag=nass-dev .
docker run -p 5678:5678 -v `pwd`:/root -it --entrypoint /bin/ash nass-dev

# Remains from container build volume
sudo rm -rf .gnupg .ash_history go keys .password-store
```

## Related projects
* https://github.com/BenoitZugmeyer/pass-web
