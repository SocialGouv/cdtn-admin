#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v docker &>/dev/null; then
  echo "${RED}Error : docker is not installed.${NC}"
  exit 1
fi

function usage() {
  echo "Usage: $0 [OPTIONS] dump"
  echo "Options:"
  echo " -h, --help                    Display this help message"
}

handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
    -h | --help)
      usage
      exit 0
      ;;
    *)
      if [ -z "$dump_file" ]; then
        dump_file=$1
      else
        echo -e "${RED}Invalid option: $1${NC}" >&2
        usage
        exit 1
      fi
      ;;
    esac
    shift
  done
}

# Main script execution
handle_options "$@"

dump_file=$1

if [ ! -f "$dump_file" ]; then
  echo -e "${RED}Erreur : Le fichier '$dump_file' n'existe pas.${NC}"
  exit 1
fi

echo -e "${YELLOW}Suppression de l'environnement...${NC}"

docker compose down --volumes

echo -e "${YELLOW}Démarrage de la base de données...${NC}"

docker compose up --wait -d postgres
sleep 5

echo -e "${YELLOW}Restore de la base de données...${NC}"

docker compose exec -T postgres pg_restore \
  --dbname postgres --clean --if-exists --user postgres \
  --no-owner --no-acl --verbose <$dump_file

echo -e "${YELLOW}Clean de la base de données...${NC}"

docker compose exec -T postgres psql \
  --dbname postgres --user postgres <.kontinuous/sql/post-restore.sql

echo -e "${YELLOW}Correction de Hasura pour la migration...${NC}"

docker compose exec -T postgres psql \
  --dbname postgres --user postgres <scripts/fix_hasura_after_migration.sql

echo -e "${YELLOW}Préparation du répertoire des migrations...${NC}"

# Rename migrations directory temporarily to prevent Hasura from trying to apply them
if [ -d "targets/hasura/migrations" ]; then
  mv targets/hasura/migrations targets/hasura/migrations_backup
fi

# Create empty migrations directory structure to satisfy Hasura
mkdir -p targets/hasura/migrations/default

echo -e "${YELLOW}Lancement d'hasura, d'elasticsearch et de minio...${NC}"

docker compose up --wait -d hasura elasticsearch minio createbuckets

echo -e "${YELLOW}Restauration du répertoire des migrations...${NC}"

# Restore original migrations directory
if [ -d "targets/hasura/migrations_backup" ]; then
  rm -rf targets/hasura/migrations
  mv targets/hasura/migrations_backup targets/hasura/migrations
fi

echo -e "${GREEN}Environnement prêt \o/${NC}"
