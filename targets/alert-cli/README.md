# Migration scripts

## Usage

```sh
# from project root dir
$ docker run --rm registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-admin/scripts
```

## Build

```sh
# from project root dir
$ docker build -f targets/alert-cli/Dockerfile --shm-size 512M -t registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-admin/scripts .
```

## To run locally

```sh
# from project cdtn-admin/targets/alert-cli dir
yarn start:debug
```
