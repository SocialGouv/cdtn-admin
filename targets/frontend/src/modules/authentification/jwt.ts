import jwt, { Algorithm, verify } from "jsonwebtoken";
import { Session } from "next-auth";

const getJwtToken = (): { type: Algorithm; key: string } => {
  return JSON.parse(
    process.env.HASURA_GRAPHQL_JWT_SECRET ??
      '{"type":"HS256","key":"a_pretty_long_secret_key_that_should_be_at_least_32_char"}'
  );
};

export type LightUser = Pick<
  Session["user"],
  "email" | "id" | "name" | "role" | "expiresIn"
>;

export type UserStoredInJwt = Pick<LightUser, "id" | "role" | "name">;

export function generateJwtToken(
  user: UserStoredInJwt,
  expiresInMinutes: number
) {
  const jwtSecret = getJwtToken();
  return jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": [user.role],
        "x-hasura-default-role": user.role,
        "x-hasura-user-id": user.id,
        "x-hasura-user-name": user.name,
      },
    },
    jwtSecret.key,
    {
      algorithm: jwtSecret.type,
      expiresIn: `${expiresInMinutes}m`,
    }
  );
}

export function verifyJwtToken(token: string) {
  const jwtSecret = getJwtToken();
  return verify(token, jwtSecret.key, { algorithms: [jwtSecret.type] });
}
