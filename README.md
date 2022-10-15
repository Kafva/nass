# nass


## Server

```bash

# Release
docker build --rm --tag=nass .
docker run -p 5678:5678 -d nass

# Development
docker build -f Dockerfile.dev --rm --tag=nass-dev .
docker run -p 5678:5678 -v `pwd`/scripts:/nass/scripts -it --entrypoint /bin/ash nass-dev

NASS_KEY=xd go run ./main.go -c conf/nass.yml -u conf/users.yml
```

## Related projects
* https://github.com/BenoitZugmeyer/pass-web
