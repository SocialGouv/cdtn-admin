#!/bin/sh
# Lance le serveur MCP Metabase (déclaré dans .mcp.json) avec les credentials
# lus dans analysis/.env — jamais dans un fichier versionné.
#
# Serveur : @easecloudio/mcp-metabase-server, version épinglée
# (source : https://github.com/easecloudio/mcp-metabase-server, tag v1.3.0).
#
# Variables (une variable déjà exportée dans le shell a priorité sur le .env) :
#   METABASE_URL            instance Metabase (défaut : instance CDTN)
#   METABASE_API_KEY        clé d'API Metabase (requise)
#   METABASE_MCP_TOOL_MODE  essential | read | all (défaut : all)
set -eu

# shellcheck source=scripts/mcp/_env.sh
. "$(dirname "$0")/_env.sh"

METABASE_URL=${METABASE_URL:-$(read_key METABASE_URL)}
METABASE_URL=${METABASE_URL:-https://metabase-cdtn.fabrique.social.gouv.fr}
METABASE_API_KEY=${METABASE_API_KEY:-$(read_key METABASE_API_KEY)}
TOOL_MODE=${METABASE_MCP_TOOL_MODE:-$(read_key METABASE_MCP_TOOL_MODE)}
TOOL_MODE=${TOOL_MODE:-all}

if [ -z "$METABASE_API_KEY" ]; then
  echo "mcp-metabase: METABASE_API_KEY manquant — renseigner analysis/.env (cf. analysis/.env.example)." >&2
  exit 1
fi

export METABASE_URL METABASE_API_KEY TOOL_MODE
exec npx --ignore-scripts -y @easecloudio/mcp-metabase-server@1.3.0
