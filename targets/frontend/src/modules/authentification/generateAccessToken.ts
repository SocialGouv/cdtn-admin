import {
  AuthGqlError,
  AuthJwtRefreshError,
  AuthUserDeleted,
} from "./utils/errors";
import { UserStoredInJwt, generateJwtToken, verifyToken } from "./utils/jwt";
import { JWT_TOKEN_EXPIRES } from "src/config";
import { UserSignedIn } from "./signIn";
import { gqlClient } from "@shared/utils";

const getUserByMailQuery = `
  query login($email: citext!) {
    auth_users(where: {email: {_eq: $email}}) {
      isDeleted
    }
  }
`;

interface GetUserByMailHasuraResult {
  auth_users: { isDeleted: boolean }[];
}

export const generateNewAccessToken = async (
  user: UserSignedIn
): Promise<string> => {
  const isValid = verifyToken(user.refreshToken);

  if (!isValid) {
    throw new AuthJwtRefreshError({
      cause: null,
      message: "Invalid refresh token",
      name: "AUTH_JWT_REFRESH_ERROR",
    });
  }

  const userToSave: UserStoredInJwt = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  // Sécurité en vérifiant que l'utilisateur n'a pas été supprimé pour lui générer un nouveau token.
  const result = await gqlClient()
    .query<GetUserByMailHasuraResult>(getUserByMailQuery, {
      email: user.email,
    })
    .toPromise();

  if (result.error || !result.data?.auth_users[0]) {
    throw new AuthGqlError({
      cause: result.error,
      message: "User not find",
      name: "AUTH_GQL_ERROR",
    });
  }

  if (result.data.auth_users[0].isDeleted) {
    throw new AuthUserDeleted({
      message: `${user.email} has been deleted`,
      name: "AUTH_USER_DELETED",
      cause: null,
    });
  }

  const accessTokenGenerated = generateJwtToken(userToSave, JWT_TOKEN_EXPIRES);

  return accessTokenGenerated;
};
