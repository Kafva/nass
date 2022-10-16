<h1 align="center">nass</h1>

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
docker build -f Dockerfile.dev --rm --tag=nass-dev .
docker run -p 5678:5678 -v `pwd`/scripts:/nass/scripts -it --entrypoint /bin/ash nass-dev
```

## Related projects
* https://github.com/BenoitZugmeyer/pass-web
