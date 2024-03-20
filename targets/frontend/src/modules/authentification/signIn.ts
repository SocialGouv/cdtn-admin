import { gqlClient } from "@shared/utils";
import { LoginHasuraResult, signInQuery } from "./queries/signIn";
import {
  AuthEmailNotFound,
  AuthGqlError,
  AuthUserDeleted,
  AuthUserNotActive,
  AuthUserPasswordDifferent,
} from "./error";
import { verify } from "argon2";
import { refreshTokenMutation } from "./queries/refreshToken";
import { generateJwtToken } from "./jwt";
import { JWT_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "src/config";
import { getExpiryDate } from "src/lib/duration";
import { Session } from "next-auth";

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

  const jwt_token = generateJwtToken(user);

  const refreshTokenResult = await gqlClient()
    .mutation(refreshTokenMutation, {
      refresh_token_data: {
        expires_at: getExpiryDate(REFRESH_TOKEN_EXPIRES),
        user_id: user.id,
      },
    })
    .toPromise();

  if (refreshTokenResult.error) {
    throw new AuthGqlError({
      cause: loginResult.error,
      message: "Could not refresh token of the user",
      name: "AUTH_GQL_ERROR",
    });
  }

  const { refresh_token } = refreshTokenResult.data.insert_data.returning[0];

  return {
    ...user,
    accessToken: jwt_token,
    refreshToken: user.refresh_token,
    expiresIn: user.expires_in,
  };
};
