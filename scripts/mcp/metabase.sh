#!/bin/sh
# Lance le serveur MCP Metabase déclaré dans .mcp.json.
#
# Serveur : @easecloudio/mcp-metabase-server, version épinglée
# (source : https://github.com/easecloudio/mcp-metabase-server, tag v1.3.0).
# Config publique : bloc "env" de .mcp.json. Secret : METABASE_API_KEY, lu dans
# le .env racine (ou exporté dans le shell).
#
# L'URL publique est derrière un oauth2-proxy (SSO GitHub SocialGouv) qui bloque
# les appels d'API par clé. Si kubectl a accès à METABASE_KUBE_NAMESPACE, le
# wrapper ouvre donc un port-forward vers le service metabase (port local
# libre, fermé avec le serveur MCP) ; sinon il utilise METABASE_URL.
set -eu

# shellcheck source=scripts/mcp/_env.sh
. "$(dirname "$0")/_env.sh"

METABASE_URL=${METABASE_URL:-https://metabase-cdtn.fabrique.social.gouv.fr}
TOOL_MODE=${TOOL_MODE:-all}
METABASE_API_KEY=$(secret METABASE_API_KEY)
require_secret METABASE_API_KEY "$METABASE_API_KEY"

pf_pid=""
cleanup() {
  [ -z "$pf_pid" ] || kill "$pf_pid" 2>/dev/null || true
  [ -z "${pf_log:-}" ] || rm -f "$pf_log"
}

if [ -n "${METABASE_KUBE_NAMESPACE:-}" ] && command -v kubectl >/dev/null 2>&1 &&
  kubectl ${METABASE_KUBE_CONTEXT:+--context "$METABASE_KUBE_CONTEXT"} -n "$METABASE_KUBE_NAMESPACE" \
    get svc metabase >/dev/null 2>&1; then
  pf_log=$(mktemp)
  trap cleanup EXIT
  trap 'exit 143' INT TERM
  kubectl ${METABASE_KUBE_CONTEXT:+--context "$METABASE_KUBE_CONTEXT"} -n "$METABASE_KUBE_NAMESPACE" \
    port-forward svc/metabase :80 </dev/null >"$pf_log" 2>&1 &
  pf_pid=$!
  port=""
  i=0
  while [ -z "$port" ] && [ "$i" -lt 100 ]; do
    port=$(sed -n 's/^Forwarding from 127\.0\.0\.1:\([0-9]*\) .*/\1/p' "$pf_log" | head -n 1)
    [ -n "$port" ] || { sleep 0.2; i=$((i + 1)); }
  done
  if [ -z "$port" ]; then
    echo "mcp-metabase: port-forward impossible :" >&2
    cat "$pf_log" >&2
    exit 1
  fi
  METABASE_URL=http://127.0.0.1:$port
  echo "mcp-metabase: port-forward $METABASE_KUBE_NAMESPACE/svc/metabase -> $METABASE_URL" >&2
else
  echo "mcp-metabase: pas d'accès kubectl à ${METABASE_KUBE_NAMESPACE:-?}, utilisation de $METABASE_URL" >&2
fi

export METABASE_URL METABASE_API_KEY TOOL_MODE
if [ -n "$pf_pid" ]; then
  # Pas d'exec : le shell reste pour fermer le port-forward à l'arrêt.
  npx --ignore-scripts -y @easecloudio/mcp-metabase-server@1.3.0
else
  exec npx --ignore-scripts -y @easecloudio/mcp-metabase-server@1.3.0
fi
