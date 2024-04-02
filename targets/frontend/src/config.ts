export const ACCOUNT_MAIL_SENDER = "contact@fabrique.social.gouv.fr";
export const JWT_TOKEN_EXPIRES = 15; // 15 min
export const REFRESH_TOKEN_EXPIRES = 43200; // 30 days in minutes
export const USER_ACTIVATION_TOKEN_EXPIRES = 1440; // 1 day in minutes
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "http://localhost:3001";
