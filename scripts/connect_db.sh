#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v kubectl &>/dev/null; then
  echo "${RED}Error : kubectl is not installed.${NC}"
  exit 1
fi

write_mode=false
port=5435
namespace=$(
  kubectl config view --minify --output 'jsonpath={..namespace}'
  echo
)

function usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo " -h, --help                    Display this help message"
  echo " -n, --namespace               Set a specific namespace (run on the current otherwise)"
  echo " -p, --port                    Set a specific port for the postgres connexion (5435 by default)"
  echo " -w, --write-mode              Connect to the primary (read/write) pg instance. Connect to a replica (read only) by default"
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
    -w | --write-mode)
      write_mode=true
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
    -p | --port*)
      if ! has_argument $@; then
        echo -e "${RED}Port manquant.${NC}" >&2
        usage
        exit 1
      fi

      port=$(extract_argument $@)

      if [[ ! $port =~ ^[0-9]+$ ]]; then
        echo -e "${RED}Le port doit être composé de chiffre uniquement.${NC}" >&2
        usage
        exit 1
      fi

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

# Main script execution
handle_options "$@"

environment=$(kubectl config current-context)
current_context=$(kubectl config current-context)

if [[ $write_mode == "true" ]]; then
  echo -e "Connection à la base de données de $namespace en mode ${RED}lecture et écriture${NC} (cluster: ${YELLOW}$environment${NC})."
else
  echo -e "Connection à la base de données de $namespace en mode lecture seule (cluster: ${YELLOW}$environment${NC})."
fi

if [[ $write_mode == "true" && $current_context == *"prod"* ]]; then
  echo -e "${RED}Attention ! Connection sur l'environnement de production en mode écriture. Il est recommandé de ne pas écrire directement sur une base de données en prod.${NC}"
fi

# Get the pg instance
if [[ $write_mode == "true" ]]; then
  pg_type="primary"
else
  pg_type="replica"
fi

pg_pods=$(kubectl -n $namespace get po --selector=cnpg.io/podRole=instance -o=custom-columns="NAME:.metadata.name,ROLE:.metadata.labels.role")
pg_pods_filtered=$(kubectl -n $namespace get po --selector=cnpg.io/podRole=instance -o=custom-columns="NAME:.metadata.name,ROLE:.metadata.labels.role" | grep "$pg_type")
pod=$(echo "$pg_pods_filtered" | awk 'NR==1{print $1}')

if [ -z "$pod" ]; then
  echo -e "${RED}Erreur, impossible de trouver le pod cnpg $pg_type dans le namespace ${YELLOW}$namespace${RED}.${NC}"
  echo -e "${RED}Voici les pods trouvés:\n$pg_pods\n$pg_pods_filtered${NC}"
  exit 1
fi

echo -e "Utilisation du pod ${GREEN}$pod${NC} (${YELLOW}$pg_type${NC})"

secret=$(kubectl -n $namespace get secret pg-app -o jsonpath='{.data.DATABASE_URL}' | base64 -d)

if [ -z "$secret" ]; then
  echo -e "${RED}Erreur, impossible de trouver les informations d'authentification pour le namespace ${YELLOW}$namespace${RED}.${NC}"
  exit 1
fi

local_connection=$(echo "$secret" | sed "s/pg-rw:5432/127.0.0.1:$port/")
local_connection_ssl_disabled=$(echo "$local_connection" | sed 's/?sslmode=require/?sslmode=disable/')
local_connection_without_ssl=$(echo "$local_connection" | sed 's/?sslmode=require//')

echo -e "Activation du port forwarding..."
kubectl port-forward -n $namespace $pod $port:5432 >/dev/null 2>&1 &
pid=$!

# kill the port-forward regardless of how this script exits
trap '{
    echo "Déconnexion du port forwarding"
    kill $pid
}' EXIT

# wait for $port to become available
while ! nc -vz localhost $port >/dev/null 2>&1; do
  sleep 0.1
done
echo -e "Port forwarding : ${GREEN}OK${NC}"
echo -e "${GREEN}Adresse de connexion pour se connecter à la BDD depuis votre poste :\n$local_connection_ssl_disabled${NC}"
echo -e ""
echo -e "For DBeaver user"
echo -e "Click New connection > From JDBC URL > Paste this url (see https://github.com/dbeaver/dbeaver/issues/1802#issuecomment-940810790)"
echo -e "${GREEN}jdbc:$local_connection_without_ssl ${GREEN}"

echo -e "Appuyez sur Ctrl+C pour quitter."
while true; do
  sleep 1
done
