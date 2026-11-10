// Configuration lue à l'exécution (et non au build) : l'image Docker est la
// même pour tous les environnements.
//
// POURQUOI CE MÉCANISME
// ---------------------
// Next.js n'expose une variable au navigateur que via le préfixe
// `NEXT_PUBLIC_`, dont la valeur est remplacée littéralement dans le code
// pendant `next build`. Changer la variable au démarrage du conteneur n'a alors
// aucun effet : il faudrait un build par environnement.
//
// FONCTIONNEMENT
// --------------
// - Côté serveur : `getRuntimeEnv` lit `process.env` (valeur du conteneur).
// - Côté navigateur : `getRuntimeEnv` lit `window.__ENV`. `_document` charge en
//   premier dans le <head> le script `/api/runtime-env` (synchrone, donc évalué
//   avant les bundles Next qui sont en `defer`).
// - Ce script est servi par une route API, et non inliné dans `_document` :
//   les pages de l'admin sont optimisées statiquement (pas de
//   `getServerSideProps`), leur HTML est donc généré au build et figerait les
//   valeurs de l'environnement de build.
// - Seules les clés de `CLIENT_ENV_KEYS` sont envoyées au navigateur (liste
//   blanche). Les autres (secrets, `NEXTAUTH_URL`...) restent côté serveur.
//
// PRÉREQUIS ET LIMITES
// --------------------
// - Le code exécuté dans le navigateur doit passer par `getRuntimeEnv`.
//   Lire `process.env.XXX` directement donne `undefined` côté navigateur.
// - Ne pas réintroduire de préfixe `NEXT_PUBLIC_` pour ces variables.
// - Pour ajouter une variable lue par le navigateur : l'ajouter à
//   `CLIENT_ENV_KEYS`, la définir dans les `www.configmap.yaml` de chaque
//   environnement (.kontinuous/env/*/templates/), puis l'utiliser via
//   `getRuntimeEnv`.

export const CLIENT_ENV_KEYS = [
  "BUCKET_PUBLIC_ENDPOINT",
  "BUCKET_DEFAULT_FOLDER",
  "BUCKET_DRAFT_FOLDER",
] as const;

export type ClientEnvKey = (typeof CLIENT_ENV_KEYS)[number];
export type ClientEnv = Partial<Record<ClientEnvKey, string>>;

declare global {
  interface Window {
    __ENV?: ClientEnv;
  }
}

export const getRuntimeEnv = (key: ClientEnvKey): string | undefined => {
  if (typeof window !== "undefined") {
    return window.__ENV?.[key] || undefined;
  }
  return process.env[key] || undefined;
};

export const getBucketPublicEndpoint = () =>
  getRuntimeEnv("BUCKET_PUBLIC_ENDPOINT") ?? "http://localhost:9000";
export const getBucketDefaultFolder = () =>
  getRuntimeEnv("BUCKET_DEFAULT_FOLDER") ?? "default";
export const getBucketDraftFolder = () =>
  getRuntimeEnv("BUCKET_DRAFT_FOLDER") ?? "draft";

/**
 * Script exposant les variables utiles au navigateur.
 * Les caractères pouvant fermer une balise <script> sont échappés.
 */
export const getClientEnvScript = (): string => {
  const clientEnv: ClientEnv = {};
  for (const key of CLIENT_ENV_KEYS) {
    const value = process.env[key];
    if (value) clientEnv[key] = value;
  }
  const json = JSON.stringify(clientEnv)
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
  return `window.__ENV=${json};`;
};
