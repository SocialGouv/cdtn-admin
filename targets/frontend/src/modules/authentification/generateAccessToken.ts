import { AuthJwtRefreshError } from "./errors";
import { UserStoredInJwt, generateJwtToken, verifyToken } from "./jwt";
import { JWT_TOKEN_EXPIRES } from "src/config";
import { UserSignedIn } from "./signIn";

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

  const accessTokenGenerated = generateJwtToken(userToSave, JWT_TOKEN_EXPIRES);

  return accessTokenGenerated;
};
