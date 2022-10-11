# nass


## Server

```bash
docker build --rm --tag=nass .

# Release
docker run -p 5678:5678 -d nass

# Development
docker run -p 5678:5678 -v `pwd`/scripts:/nass/scripts -it --entrypoint /bin/ash nass
```

## Related projects
* https://github.com/BenoitZugmeyer/pass-web
