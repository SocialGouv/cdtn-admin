export const ACCOUNT_MAIL_SENDER = "contact@fabrique.social.gouv.fr";
export const JWT_TOKEN_EXPIRES = 15; // 15 min
export const REFRESH_TOKEN_EXPIRES = 43200; // 30 days in minutes
export const USER_ACTIVATION_TOKEN_EXPIRES = 1440; // 1 day in minutes
// URL publique de l'admin, côté serveur uniquement (liens des emails).
// Reprend `NEXTAUTH_URL`, déjà définie pour chaque environnement.
export const getBaseUrl = () =>
  process.env.NEXTAUTH_URL ?? "http://localhost:3001";
