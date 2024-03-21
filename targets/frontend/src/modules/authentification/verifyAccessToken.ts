import { verifyJwtToken } from "./jwt";

export const verifyAccessToken = async (accessToken: string) => {
  const tokenVerified = verifyJwtToken(accessToken);

  if (typeof tokenVerified === "string") {
    return false;
  }

  const validity = (tokenVerified.exp ?? 0) * 1000 - Date.now();

  if (validity < 0) {
    return false;
  }

  return true;
};
