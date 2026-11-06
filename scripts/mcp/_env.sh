# shellcheck shell=sh
# Helper sourcé par les wrappers MCP de ce dossier (pas exécutable seul).
#
# Localise analysis/.env — celui du checkout courant, sinon celui du checkout
# principal (cas d'un worktree, où le .env gitignoré n'existe pas) — et expose
# read_key KEY, qui lit UNE clé sans sourcer le fichier (aucune exécution de son
# contenu) et retire d'éventuels guillemets autour de la valeur.

_mcp_root=$(git rev-parse --show-toplevel)
_mcp_main=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")

MCP_ENV_FILE=""
for _f in "$_mcp_root/analysis/.env" "$_mcp_main/analysis/.env"; do
  if [ -f "$_f" ]; then
    MCP_ENV_FILE=$_f
    break
  fi
done

read_key() {
  [ -n "$MCP_ENV_FILE" ] || return 0
  sed -n "s/^[[:space:]]*\(export[[:space:]]\{1,\}\)\{0,1\}$1[[:space:]]*=[[:space:]]*//p" "$MCP_ENV_FILE" |
    tail -n 1 | sed -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}
