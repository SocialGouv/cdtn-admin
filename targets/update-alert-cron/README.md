# Migration scripts

## Usage

```sh
# from project root dir
$ docker run --rm registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-admin/scripts
```

## Build

```sh
# from project root dir
$ docker build -f scripts/Dockerfile --shm-size 512M -t registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-admin/scripts .
```
