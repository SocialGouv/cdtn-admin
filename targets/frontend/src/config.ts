export const ACCOUNT_MAIL_SENDER = "contact@fabrique.social.gouv.fr";
export const JWT_TOKEN_EXPIRES = 15; // 15 min
export const REFRESH_TOKEN_EXPIRES = 43200; // 30 days in minutes
export const ACTIVATION_TOKEN_EXPIRES = 10080; // 7 days in minutes
export const HASURA_GRAPHQL_JWT_SECRET =
  process.env.HASURA_GRAPHQL_JWT_SECRET ??
  '{"type":"HS256","key":"a_pretty_long_secret_key_that_should_be_at_least_32_char"}';
export const BASE_URL = process.env.FRONTEND_HOST || `http://localhost:3000`;
