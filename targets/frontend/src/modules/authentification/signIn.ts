import { gqlClient } from "@shared/utils";
import { LoginHasuraResult, signInQuery } from "./queries/signIn";
import {
  AuthEmailNotFound,
  AuthGqlError,
  AuthJwtRefreshError,
  AuthUserDeleted,
  AuthUserNotActive,
  AuthUserPasswordDifferent,
} from "./error";
import { verify } from "argon2";
import { generateJwtToken } from "./jwt";
import { REFRESH_TOKEN_EXPIRES } from "src/config";
import { getExpiryDate } from "src/lib/duration";
import { Session } from "next-auth";
import {
  UpdateRefreshTokenHasuraResult,
  updateRefreshTokenMutation,
} from "./queries/updateRefreshToken";

export const signIn = async (
  email: string,
  password: string
): Promise<Session["user"]> => {
  const loginResult = await gqlClient()
    .query<LoginHasuraResult>(signInQuery, {
      email,
    })
    .toPromise();

  if (loginResult.error) {
    throw new AuthGqlError({
      cause: loginResult.error,
      message: "Error with password or email",
      name: "AUTH_GQL_ERROR",
    });
  }

  if (loginResult.data?.auth_users.length === 0) {
    throw new AuthEmailNotFound({
      message: `No user with ${email}`,
      name: "AUTH_EMAIL_NOT_FOUND",
      cause: null,
    });
  }

  const user = loginResult.data?.auth_users[0];

  if (!user?.isActive) {
    throw new AuthUserNotActive({
      message: `${email} is not activated`,
      name: "AUTH_USER_NOT_ACTIVE",
      cause: null,
    });
  }

  if (user.isDeleted) {
    throw new AuthUserDeleted({
      message: `${email} has been deleted`,
      name: "AUTH_USER_DELETED",
      cause: null,
    });
  }

  const match = await verify(user.password, password);

  if (!match) {
    throw new AuthUserPasswordDifferent({
      message: "Invalid 'email' or 'password'",
      name: "AUTH_USER_PASSWORD_DIFFERENT",
      cause: null,
    });
  }

  const accessTokenGenerated = generateJwtToken(user);
  const refreshTokenGenerated = generateJwtToken(user);
  const expiresInGenerated = getExpiryDate(REFRESH_TOKEN_EXPIRES);

  // update the refresh token, the access token, and the expiry date
  const refreshTokenResult = await gqlClient()
    .mutation<UpdateRefreshTokenHasuraResult>(updateRefreshTokenMutation, {
      refreshToken: refreshTokenGenerated,
      accessToken: accessTokenGenerated,
      expiresIn: expiresInGenerated,
    })
    .toPromise();

  if (refreshTokenResult.error) {
    throw new AuthGqlError({
      cause: loginResult.error,
      message: "Could not refresh token of the user",
      name: "AUTH_GQL_ERROR",
    });
  }

  const refreshToken =
    refreshTokenResult.data?.update_auth_users_by_pk?.refreshToken;
  const accessToken =
    refreshTokenResult.data?.update_auth_users_by_pk?.accessToken;
  const expiresIn = refreshTokenResult.data?.update_auth_users_by_pk?.expiresIn;

  if (!accessToken || !refreshToken || !expiresIn) {
    throw new AuthJwtRefreshError({
      cause: loginResult.error,
      message: "Could not refresh token of the user",
      name: "AUTH_JWT_REFRESH_ERROR",
    });
  }

  return {
    ...user,
    accessToken,
    refreshToken,
    expiresIn: new Date(expiresIn),
  };
};
