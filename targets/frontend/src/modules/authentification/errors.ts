import { ErrorBase } from "src/lib/api";

export class AuthGqlError extends ErrorBase<"AUTH_GQL_ERROR"> {}

export class AuthUserNotFound extends ErrorBase<"AUTH_USER_NOT_FOUND"> {}

export class AuthUserNotActive extends ErrorBase<"AUTH_USER_NOT_ACTIVE"> {}

export class AuthUserDeleted extends ErrorBase<"AUTH_USER_DELETED"> {}

export class AuthUserPasswordDifferent extends ErrorBase<"AUTH_USER_PASSWORD_DIFFERENT"> {}

export class AuthJwtRefreshError extends ErrorBase<"AUTH_JWT_REFRESH_ERROR"> {}

export class AuthRefreshTokenExpired extends ErrorBase<"AUTH_REFRESH_TOKEN_EXPIRED"> {}

export class AuthEmailSendError extends ErrorBase<"SEND_EMAIL_ERROR"> {}

export class AuthEmailResetPasswordError extends ErrorBase<"SEND_EMAIL_RESET_PASSWORD_ERROR"> {}
