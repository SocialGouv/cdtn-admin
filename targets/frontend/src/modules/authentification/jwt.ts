import jwt, { Algorithm, verify } from "jsonwebtoken";
import { Session } from "next-auth";

const getJwtTokenSecret = (): { type: Algorithm; key: string } => {
  return JSON.parse(
    process.env.HASURA_GRAPHQL_JWT_SECRET ??
      '{"type":"HS256","key":"a_pretty_long_secret_key_that_should_be_at_least_32_char"}'
  );
};

export type LightUser = Pick<
  Session["user"],
  "email" | "id" | "name" | "role" | "expiresIn" | "accessToken"
>;

export type UserStoredInJwt = Pick<LightUser, "id" | "role" | "name">;

export type HasuraJwtToken = {
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": string[];
    "x-hasura-default-role": string;
    "x-hasura-user-id": string;
    "x-hasura-user-name": string;
  };
  iat: number;
  exp: number;
};

export function generateJwtToken(
  user: UserStoredInJwt,
  expiresInMinutes: number
) {
  const jwtSecret = getJwtTokenSecret();
  return jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": [user.role],
        "x-hasura-default-role": user.role,
        "x-hasura-user-id": user.id,
        "x-hasura-user-name": user.name,
      } as HasuraJwtToken["https://hasura.io/jwt/claims"],
    },
    jwtSecret.key,
    {
      algorithm: jwtSecret.type,
      expiresIn: `${expiresInMinutes}m`,
    }
  );
}

export function getJwtToken(token: string): HasuraJwtToken {
  const jwtSecret = getJwtTokenSecret();
  const payloadToken = verify(token, jwtSecret.key, {
    algorithms: [jwtSecret.type],
  });
  if (typeof payloadToken === "string") {
    throw new Error("Invalid token");
  }
  return payloadToken as HasuraJwtToken;
}

export const verifyToken = (token?: string) => {
  try {
    if (!token) return false;
    const tokenVerified = getJwtToken(token);

    const validity = tokenVerified.exp * 1000 - Date.now();

    if (validity < 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
