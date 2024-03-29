import { gqlClient } from "@shared/utils";
import {
  AuthGqlError,
  AuthUserDeleted,
  AuthUserNotActive,
  AuthUserNotFound,
  AuthUserPasswordDifferent,
} from "./errors";
import { verify } from "argon2";
import { UserStoredInJwt, generateJwtToken } from "./jwt";
import { JWT_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "src/config";
import { gql } from "urql";

const signInQuery = gql`
  query login($email: citext!) {
    auth_users(where: { email: { _eq: $email } }) {
      id
      email
      password
      name
      isActive
      isDeleted
      role
    }
  }
`;

interface LoginHasuraResult {
  auth_users: Required<
    Pick<UserSignedIn, "id" | "email" | "name" | "role"> & {
      password: string;
      isActive: boolean;
      isDeleted: boolean;
    }
  >[];
}

export type UserSignedIn = {
  id: string;
  name: string;
  email: string;
  role: "super" | "user";
  accessToken: string;
  refreshToken: string;
};

export const signIn = async (
  email: string,
  password: string
): Promise<UserSignedIn> => {
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

  if (
    loginResult.data?.auth_users.length === 0 ||
    !loginResult.data?.auth_users[0]
  ) {
    throw new AuthUserNotFound({
      message: `No user with ${email}`,
      name: "AUTH_USER_NOT_FOUND",
      cause: null,
    });
  }

  const user = loginResult.data.auth_users[0];

  if (!user.isActive) {
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

  const userToSave: UserStoredInJwt = {
    id: user.id,
    role: user.role,
    name: user.name,
  };

  const accessTokenGenerated = generateJwtToken(userToSave, JWT_TOKEN_EXPIRES);
  const refreshTokenGenerated = generateJwtToken(
    userToSave,
    REFRESH_TOKEN_EXPIRES
  );

  return {
    ...userToSave,
    email: user.email,
    accessToken: accessTokenGenerated,
    refreshToken: refreshTokenGenerated,
  };
};
