import { gqlClient } from "@shared/utils";
import { signInQuery } from "./queries/signIn";
import {
  AuthEmailNotFound,
  AuthGqlError,
  AuthUserDeleted,
  AuthUserNotActive,
  AuthUserPasswordDifferent,
} from "./error";
import { verify } from "argon2";

interface HasuraResult {
  contribution_answers: Pick<
    ContributionsAnswers,
    "id" | "question" | "legi_references" | "kali_references" | "agreement"
  >[];
}

export const signIn = async (email: string, password: string) => {
  const loginResult = await gqlClient()
    .query(signInQuery, {
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

  if (loginResult.data.users?.length === 0) {
    throw new AuthEmailNotFound({
      message: `No user with ${email}`,
      name: "AUTH_EMAIL_NOT_FOUND",
      cause: null,
    });
  }

  const user = loginResult.data.users[0];

  if (!user.active) {
    throw new AuthUserNotActive({
      message: `${email} is not activated`,
      name: "AUTH_USER_NOT_ACTIVE",
      cause: null,
    });
  }

  if (user.deleted) {
    throw new AuthUserDeleted({
      message: `${email} has been deleted`,
      name: "AUTH_USER_DELETED",
      cause: null,
    });
  }

  // see if password hashes matches
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
    return apiError(
      Boom.badImplementation(
        "Could not update 'refresh token' for user",
        username
      )
    );
  }

  const { refresh_token } = refreshTokenResult.data.insert_data.returning[0];

  setJwtCookie(res, refresh_token, jwt_token);

  res.json({
    jwt_token,
    jwt_token_expiry: getExpiryDate(JWT_TOKEN_EXPIRES),
    refresh_token,
  });
};
