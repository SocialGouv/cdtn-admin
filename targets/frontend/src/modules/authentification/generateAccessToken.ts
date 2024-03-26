import { gqlClient } from "@shared/utils";
import {
  AuthGqlError,
  AuthJwtAccessError,
  AuthJwtRefreshError,
  AuthRefreshTokenExpired,
  AuthUserNotFound,
} from "./errors";
import { generateJwtToken, verifyToken } from "./jwt";
import { JWT_TOKEN_EXPIRES } from "src/config";
import {
  UpdateAccessTokenHasuraResult,
  updateAccessTokenMutation,
} from "./queries/updateAccessToken";
import {
  GetLightUserHasuraResult,
  getLightUserQuery,
} from "./queries/getLightUser";

export const generateNewAccessToken = async (
  refreshToken: string,
  oldAccessToken: string
): Promise<string> => {
  const isValid = verifyToken(refreshToken);

  if (!isValid) {
    throw new AuthJwtRefreshError({
      cause: null,
      message: "Invalid refresh token",
      name: "AUTH_JWT_REFRESH_ERROR",
    });
  }

  const userToSaveResult = await gqlClient()
    .query<GetLightUserHasuraResult>(getLightUserQuery, {
      accessToken: oldAccessToken,
      refreshToken,
    })
    .toPromise();

  if (userToSaveResult.error) {
    throw new AuthGqlError({
      cause: userToSaveResult.error,
      message: "Error with accessToken or refreshToken",
      name: "AUTH_GQL_ERROR",
    });
  }

  if (
    userToSaveResult.data?.auth_users.length === 0 ||
    !userToSaveResult.data?.auth_users[0]
  ) {
    throw new AuthUserNotFound({
      message: `No user with this refresh and access token`,
      name: "AUTH_USER_NOT_FOUND",
      cause: null,
    });
  }

  const userToSave = userToSaveResult.data?.auth_users[0];

  const validity = new Date(userToSave.expiresIn).getTime() * 1000 - Date.now();

  if (validity < 0) {
    throw new AuthRefreshTokenExpired({
      message: `The refresh token has expired`,
      name: "AUTH_REFRESH_TOKEN_EXPIRED",
      cause: null,
    });
  }

  if (userToSave.accessToken !== oldAccessToken) {
    throw new AuthJwtAccessError({
      message: `Old access token is not valid`,
      name: "AUTH_JWT_ACCESS_ERROR",
      cause: null,
    });
  }

  const accessTokenGenerated = generateJwtToken(userToSave, JWT_TOKEN_EXPIRES);

  const updateTokenResult = await gqlClient()
    .mutation<UpdateAccessTokenHasuraResult>(updateAccessTokenMutation, {
      id: userToSave.id,
      accessToken: accessTokenGenerated,
    })
    .toPromise();

  if (updateTokenResult.error) {
    throw new AuthGqlError({
      cause: updateTokenResult.error,
      message: "Could not set accessToken or refreshToken",
      name: "AUTH_GQL_ERROR",
    });
  }

  if (!updateTokenResult.data?.update_auth_users_by_pk.accessToken) {
    throw new AuthJwtRefreshError({
      cause: null,
      message: "Could not update access token",
      name: "AUTH_JWT_REFRESH_ERROR",
    });
  }

  return updateTokenResult.data.update_auth_users_by_pk.accessToken;
};
