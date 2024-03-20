import { ErrorBase } from "src/lib/api";

export class AuthGqlError extends ErrorBase<"AUTH_GQL_ERROR"> {}

export class AuthEmailNotFound extends ErrorBase<"AUTH_EMAIL_NOT_FOUND"> {}

export class AuthUserNotActive extends ErrorBase<"AUTH_USER_NOT_ACTIVE"> {}

export class AuthUserDeleted extends ErrorBase<"AUTH_USER_DELETED"> {}

export class AuthUserPasswordDifferent extends ErrorBase<"AUTH_USER_PASSWORD_DIFFERENT"> {}

export class AuthJwtRefreshError extends ErrorBase<"AUTH_JWT_REFRESH_ERROR"> {}
