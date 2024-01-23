#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v kubectl &>/dev/null; then
  echo "${RED}Error : kubectl is not installed.${NC}"
  exit 1
fi

namespace=$(
  kubectl config view --minify --output 'jsonpath={..namespace}'
  echo
)
folder="local_dump"
output="dump_$(date +%d_%m_%Y_%H_%M_%S).psql"

function usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo " -h, --help                    Display this help message"
  echo " -n, --namespace               Set a specific namespace (run on the current otherwise)"
}

has_argument() {
  [[ ("$1" == *=* && -n ${1#*=}) || (! -z "$2" && "$2" != -*) ]]
}

extract_argument() {
  echo "${2:-${1#*=}}"
}

handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
    -h | --help)
      usage
      exit 0
      ;;
    -n | --namespace*)
      if ! has_argument $@; then
        echo -e "${RED}Namespace manquant.${NC}" >&2
        usage
        exit 1
      fi

      namespace=$(extract_argument $@)

      shift
      ;;
    *)
      echo "Invalid option: $1" >&2
      usage
      exit 1
      ;;
    esac
    shift
  done
}

if [ ! -d "$folder" ]; then
  mkdir $folder
  echo -e "${GREEN}Création du dossier $folder${NC}"
fi

# Main script execution
handle_options "$@"

environment=$(kubectl config current-context)
current_context=$(kubectl config current-context)

echo -e "Connection à la base de données de $namespace en mode lecture seule (cluster: ${YELLOW}$environment${NC})."

# Get the pg instance
pg_type="replica"

pg_pods=$(kubectl -n $namespace get po --selector=cnpg.io/podRole=instance -o=custom-columns="NAME:.metadata.name,ROLE:.metadata.labels.role")
pg_pods_filtered=$(kubectl -n $namespace get po --selector=cnpg.io/podRole=instance -o=custom-columns="NAME:.metadata.name,ROLE:.metadata.labels.role" | grep "$pg_type")
pod=$(echo "$pg_pods_filtered" | awk '{print $1}')

if [ -z "$pod" ]; then
  echo -e "${RED}Erreur, impossible de trouver le pod cnpg $pg_type dans le namespace ${YELLOW}$namespace${RED}.${NC}"
  echo -e "${RED}Voci les pods trouvés:\n$pg_pods\n$pg_pods_filtered${NC}"
  exit 1
fi

echo -e "Utilisation du pod ${GREEN}$pod${NC} (${YELLOW}$pg_type${NC})"

database=$(kubectl -n $namespace get secret pg-app -o jsonpath='{.data.PGDATABASE}' | base64 -d)

if [ -z "$database" ]; then
  echo -e "${RED}Erreur, impossible de trouver le nom de la base de données pour le namespace ${YELLOW}$namespace${RED}.${NC}"
  exit 1
fi

echo -e "Dump de la base de données..."
kubectl exec -n $namespace $pod -c postgres -- pg_dump -Fc -d $database >${folder}/${output}

echo -e "${GREEN}Dump terminé : ${folder}/${output}${NC}"

echo -e ""
echo -e "Commande pour restaurer la BDD en local :"
echo -e "docker compose exec -T postgres pg_restore \\"
echo -e "  --dbname postgres --clean --if-exists --user postgres \\"
echo -e "  --no-owner --no-acl --verbose  < ${folder}/${output} "
