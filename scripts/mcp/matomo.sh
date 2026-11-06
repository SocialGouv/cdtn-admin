#!/bin/sh
# Lance le serveur MCP Matomo déclaré dans .mcp.json.
#
# Serveur : lucaspretti/matomo-mcp-client (MIT, pas publié sur npm), épinglé à
# un commit et vérifié par sha256. Au premier lancement, le wrapper clone ce
# commit dans le cache utilisateur, réactive la vérification TLS (l'amont la
# désactive : `rejectUnauthorized: false`) et installe les dépendances du
# lockfile sans scripts d'installation. Préinstaller (évite le timeout du
# premier démarrage MCP) : scripts/mcp/matomo.sh --install
#
# Config publique (MATOMO_HOST, MATOMO_DEFAULT_SITE_ID) : bloc "env" de .mcp.json.
# Secret : MATOMO_API_KEY, lu dans le .env racine (ou exporté dans le shell) —
# idéalement le token d'un utilisateur en lecture seule : matomo_batch accepte
# toute méthode de l'API.
set -eu

REPO=https://github.com/lucaspretti/matomo-mcp-client.git
COMMIT=3e8a22e455f0a928c155fae368e8dfe65ea0c532
# sha256 de matomo-mcp-client.js à ce commit, AVANT le correctif TLS.
SHA256=f74c4b080fbdf604441beee4408202129b120f62c57744acf08769d938cabd54

cache=${XDG_CACHE_HOME:-$HOME/.cache}/cdtn-admin/matomo-mcp-client-$COMMIT

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1"; else shasum -a 256 "$1"; fi | cut -d ' ' -f 1
}

# Toute sortie d'installation va sur stderr : stdout est le canal MCP.
install() {
  tmp="$cache.tmp.$$"
  rm -rf "$tmp"
  mkdir -p "$tmp"
  trap 'rm -rf "$tmp"' EXIT
  git -C "$tmp" init -q
  git -C "$tmp" fetch -q --depth 1 "$REPO" "$COMMIT"
  git -C "$tmp" checkout -q FETCH_HEAD
  actual=$(sha256 "$tmp/matomo-mcp-client.js")
  if [ "$actual" != "$SHA256" ]; then
    echo "mcp-matomo: sha256 inattendu pour matomo-mcp-client.js ($actual)." >&2
    exit 1
  fi
  sed 's/rejectUnauthorized: false/rejectUnauthorized: true/' "$tmp/matomo-mcp-client.js" >"$tmp/patched.js"
  grep -q 'rejectUnauthorized: true' "$tmp/patched.js"
  mv "$tmp/patched.js" "$tmp/matomo-mcp-client.js"
  (cd "$tmp" && npm ci --ignore-scripts --omit=dev --no-audit --no-fund --loglevel=error) >&2
  rm -rf "$cache"
  mv "$tmp" "$cache"
  trap - EXIT
}

[ -f "$cache/node_modules/.package-lock.json" ] || install
[ "${1:-}" = "--install" ] && exit 0

# shellcheck source=scripts/mcp/_env.sh
. "$(dirname "$0")/_env.sh"

MATOMO_HOST=${MATOMO_HOST:-https://matomo.fabrique.social.gouv.fr}
MATOMO_DEFAULT_SITE_ID=${MATOMO_DEFAULT_SITE_ID:-4}
MATOMO_TOKEN_AUTH=$(secret MATOMO_API_KEY)
require_secret MATOMO_API_KEY "$MATOMO_TOKEN_AUTH"

export MATOMO_HOST MATOMO_TOKEN_AUTH MATOMO_DEFAULT_SITE_ID
exec node "$cache/matomo-mcp-client.js"
