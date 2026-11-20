# shellcheck shell=sh
# Helper sourcé par les wrappers MCP de ce dossier (pas exécutable seul).
#
# Localise le .env racine — celui du checkout courant, sinon celui du checkout
# principal (cas d'un worktree, où le .env gitignoré n'existe pas) — et expose
# secret KEY : la valeur exportée dans le shell si elle existe, sinon la clé lue
# dans le .env SANS le sourcer (aucune exécution de son contenu), guillemets
# éventuels retirés.

_mcp_root=$(git rev-parse --show-toplevel)
_mcp_main=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")

MCP_ENV_FILE=""
for _f in "$_mcp_root/.env" "$_mcp_main/.env"; do
  if [ -f "$_f" ]; then
    MCP_ENV_FILE=$_f
    break
  fi
done

secret() {
  eval "_v=\${$1:-}"
  if [ -n "$_v" ]; then
    printf '%s' "$_v"
    return 0
  fi
  [ -n "$MCP_ENV_FILE" ] || return 0
  sed -n "s/^[[:space:]]*\(export[[:space:]]\{1,\}\)\{0,1\}$1[[:space:]]*=[[:space:]]*//p" "$MCP_ENV_FILE" |
    tail -n 1 | sed -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

require_secret() {
  if [ -z "$2" ]; then
    echo "mcp: $1 manquant — l'ajouter au .env à la racine du repo (cf. .env.example)." >&2
    exit 1
  fi
}
