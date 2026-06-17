#!/bin/bash

# Dump de la base à une date/heure passée (Point-In-Time Recovery).
#
# Contrairement à dump_db.sh (qui dumpe l'état courant), ce script restaure un
# cluster CloudNativePG jetable depuis les backups + WAL archivés sur S3, le
# rejoue jusqu'à l'instant demandé, le dumpe, puis le supprime. Lecture seule
# sur le bucket : aucun impact sur le cluster de prod.
#
# Pré-requis : le cluster source doit archiver ses WAL en continu
# (spec.backup.barmanObjectStore), ce qui est le cas en prod.
#
# Exemple : dump au lundi 08/06/2026 10h (heure de Paris)
#   ./scripts/dump_db_at.sh -n cdtn-admin -t 2026-06-08T10:00:00
#   ./scripts/dump_db_at.sh -n cdtn-admin -t 2026-06-08T10:00:00+02:00

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

for bin in kubectl jq; do
  if ! command -v "$bin" &>/dev/null; then
    echo -e "${RED}Error : $bin is not installed.${NC}"
    exit 1
  fi
done

namespace=$(
  kubectl config view --minify --output 'jsonpath={..namespace}'
  echo
)
folder="local_dump"
target_time=""
src_cluster=""
keep=false

function usage() {
  echo "Usage: $0 -t <datetime> [OPTIONS]"
  echo "Restaure un cluster temporaire à une date passée et le dumpe (PITR)."
  echo "Options:"
  echo " -h, --help                    Display this help message"
  echo " -t, --time <datetime>         Date/heure cible au format ISO 8601 SANS espace (obligatoire)."
  echo "                               Ex: 2026-06-08T10:00:00 (offset local ajouté auto)"
  echo "                               ou  2026-06-08T10:00:00+02:00"
  echo " -n, --namespace <ns>          Namespace (celui du contexte courant sinon)"
  echo " -c, --cluster <name>          Nom du cluster CNPG source (auto-détecté sinon)"
  echo " -k, --keep                    Ne pas supprimer le cluster temporaire en fin de script"
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
    -t | --time*)
      if ! has_argument $@; then
        echo -e "${RED}Date/heure manquante.${NC}" >&2
        usage
        exit 1
      fi
      target_time=$(extract_argument $@)
      shift
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
    -c | --cluster*)
      if ! has_argument $@; then
        echo -e "${RED}Nom de cluster manquant.${NC}" >&2
        usage
        exit 1
      fi
      src_cluster=$(extract_argument $@)
      shift
      ;;
    -k | --keep)
      keep=true
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

if [ -z "$target_time" ]; then
  echo -e "${RED}L'option -t/--time est obligatoire (ex: -t 2026-06-08T10:00:00).${NC}" >&2
  usage
  exit 1
fi

# Ajoute l'offset local (valide à CETTE date, gère l'heure d'été) si non précisé
if [[ ! "$target_time" =~ (Z|[+-][0-9]{2}:?[0-9]{2})$ ]]; then
  offset=$(date -d "$target_time" +%:z 2>/dev/null)
  if [ -z "$offset" ]; then
    echo -e "${RED}Date invalide : '$target_time'. Format attendu : 2026-06-08T10:00:00${NC}" >&2
    exit 1
  fi
  target_time="${target_time}${offset}"
fi

environment=$(kubectl config current-context)
echo -e "Dump PITR de $namespace au ${GREEN}$target_time${NC} (cluster: ${YELLOW}$environment${NC})."

# Auto-détection du cluster CNPG source à partir des pods d'instance
if [ -z "$src_cluster" ]; then
  src_cluster=$(kubectl -n "$namespace" get po --selector=cnpg.io/podRole=instance \
    -o jsonpath='{.items[0].metadata.labels.cnpg\.io/cluster}' 2>/dev/null)
fi
if [ -z "$src_cluster" ]; then
  echo -e "${RED}Impossible de détecter le cluster CNPG dans ${YELLOW}$namespace${RED}. Précisez-le avec -c.${NC}" >&2
  exit 1
fi
echo -e "Cluster source : ${GREEN}$src_cluster${NC}"

src_json=$(kubectl -n "$namespace" get cluster.postgresql.cnpg.io "$src_cluster" -o json 2>/dev/null)
if [ -z "$src_json" ]; then
  echo -e "${RED}Cluster ${YELLOW}$src_cluster${RED} introuvable dans ${YELLOW}$namespace${RED}.${NC}" >&2
  exit 1
fi

# Bloc d'archivage du cluster source (source des base backups + WAL pour le PITR)
bo=$(echo "$src_json" | jq '.spec.backup.barmanObjectStore')
if [ "$bo" = "null" ] || [ -z "$bo" ]; then
  echo -e "${RED}Le cluster $src_cluster n'a pas de backup.barmanObjectStore : PITR impossible.${NC}" >&2
  exit 1
fi

# serverName = dossier du serveur dans le bucket (défaut : nom du cluster)
server_name=$(echo "$bo" | jq -r '.serverName // empty')
if [ -z "$server_name" ]; then
  bo=$(echo "$bo" | jq --arg s "$src_cluster" '. + {serverName: $s}')
fi

image=$(echo "$src_json" | jq -r '.spec.imageName // empty')
storage_size=$(echo "$src_json" | jq -r '.spec.storage.size // "10Gi"')
storage_class=$(echo "$src_json" | jq -r '.spec.storage.storageClass // empty')

# Vérifie que la cible est dans la fenêtre de récupération
frp=$(echo "$src_json" | jq -r '.status.firstRecoverabilityPoint // empty')
if [ -n "$frp" ]; then
  if [ "$(date -d "$target_time" +%s)" -lt "$(date -d "$frp" +%s)" ]; then
    echo -e "${RED}La cible ($target_time) est antérieure au début de la fenêtre de récupération ($frp).${NC}" >&2
    exit 1
  fi
fi

temp_cluster="${src_cluster}-pitr"
pod="${temp_cluster}-1"

if kubectl -n "$namespace" get cluster.postgresql.cnpg.io "$temp_cluster" &>/dev/null; then
  echo -e "${RED}Le cluster temporaire ${YELLOW}$temp_cluster${RED} existe déjà. Supprimez-le d'abord :${NC}" >&2
  echo -e "${RED}  kubectl -n $namespace delete cluster $temp_cluster${NC}" >&2
  exit 1
fi

# Nettoyage du cluster temporaire (idempotent), appelé explicitement + via trap
created=false
do_cleanup() {
  if [ "$created" != true ]; then
    return
  fi
  if [ "$keep" = true ]; then
    echo -e "${YELLOW}Cluster temporaire conservé : $temp_cluster${NC}"
    echo -e "${YELLOW}  Pensez à le supprimer : kubectl -n $namespace delete cluster $temp_cluster${NC}"
    created=false
    return
  fi
  echo -e "${YELLOW}Suppression du cluster temporaire $temp_cluster...${NC}"
  kubectl -n "$namespace" delete cluster.postgresql.cnpg.io "$temp_cluster" --ignore-not-found &>/dev/null
  created=false
}
trap do_cleanup EXIT

# Cluster de restauration : 1 instance, AUCUNE section backup (n'archive rien)
manifest=$(jq -n \
  --arg name "$temp_cluster" \
  --arg image "$image" \
  --arg size "$storage_size" \
  --arg sc "$storage_class" \
  --arg src "origin" \
  --arg tt "$target_time" \
  --argjson bo "$bo" '
{
  apiVersion: "postgresql.cnpg.io/v1",
  kind: "Cluster",
  metadata: { name: $name },
  spec: ({
    instances: 1,
    storage: ({ size: $size } + (if $sc == "" then {} else { storageClass: $sc } end)),
    bootstrap: { recovery: { source: $src, recoveryTarget: { targetTime: $tt } } },
    externalClusters: [ { name: $src, barmanObjectStore: $bo } ]
  } + (if $image == "" then {} else { imageName: $image } end))
}')

echo -e "Création du cluster de restauration ${GREEN}$temp_cluster${NC}..."
if ! echo "$manifest" | kubectl -n "$namespace" apply -f - >/dev/null; then
  echo -e "${RED}Échec de la création du cluster temporaire.${NC}" >&2
  exit 1
fi
created=true

# Attente : pull du base backup + rejeu des WAL jusqu'à la cible, puis promotion
echo -e "Restauration en cours (rejeu des WAL jusqu'à $target_time)..."
timeout=1800
waited=0
interval=10
last_phase=""
while true; do
  phase=$(kubectl -n "$namespace" get cluster.postgresql.cnpg.io "$temp_cluster" \
    -o jsonpath='{.status.phase}' 2>/dev/null)
  if [ -n "$phase" ] && [ "$phase" != "$last_phase" ]; then
    echo -e "  → ${YELLOW}${phase}${NC}"
    last_phase="$phase"
  fi
  if [ "$phase" = "Cluster in healthy state" ]; then
    break
  fi
  if [ "$waited" -ge "$timeout" ]; then
    echo -e "${RED}Timeout : le cluster n'est pas prêt après ${timeout}s. Derniers logs :${NC}" >&2
    kubectl -n "$namespace" logs "$pod" -c postgres --tail=30 2>/dev/null
    exit 1
  fi
  sleep "$interval"
  waited=$((waited + interval))
done
echo -e "Cluster restauré : ${GREEN}OK${NC}"

# Détection du nom de la base applicative (la plus grosse hors bases système)
database=$(kubectl -n "$namespace" exec "$pod" -c postgres -- \
  psql -tAqc "SELECT datname FROM pg_database WHERE NOT datistemplate AND datname NOT IN ('postgres','app') ORDER BY pg_database_size(datname) DESC LIMIT 1" 2>/dev/null | tr -d '[:space:]')
if [ -z "$database" ]; then
  echo -e "${RED}Impossible de déterminer la base à dumper.${NC}" >&2
  exit 1
fi
echo -e "Base détectée : ${GREEN}$database${NC}"

if [ ! -d "$folder" ]; then
  mkdir "$folder"
  echo -e "${GREEN}Création du dossier $folder${NC}"
fi
output="dump_at_$(echo "$target_time" | tr -c 'A-Za-z0-9' '_').psql"

echo -e "Dump de la base de données..."
kubectl exec -n "$namespace" "$pod" -c postgres -- pg_dump -Fc -d "$database" >"${folder}/${output}"

echo -e "${GREEN}Dump terminé : ${folder}/${output}${NC}"

# On libère les ressources de prod dès que le dump est sur disque
do_cleanup

confirm() {
  while true; do
    read -p "Voulez-vous relancer votre environnement avec ce dump ? (Y/n) " answer
    case $answer in
    [Yy]*) break ;;
    [Nn]*)
      echo -e ""
      echo -e "Commande pour restaurer la BDD en local :"
      echo -e "docker compose exec -T postgres pg_restore \\"
      echo -e "  --dbname postgres --clean --if-exists --user postgres \\"
      echo -e "  --no-owner --no-acl --verbose  < ${folder}/${output} "
      exit
      ;;
    *) echo "Veuillez répondre par Y (oui) ou n (non)." ;;
    esac
  done
}

confirm

./scripts/reset_from_dump.sh "${folder}/${output}"
