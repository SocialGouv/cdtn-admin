import jwt from "jsonwebtoken";
import { LoginQueryUserResponse } from "../../pages/api/login.gql";

const { HASURA_GRAPHQL_JWT_SECRET, JWT_TOKEN_EXPIRES } = process.env;

type JwtSecret = {
  type: jwt.Algorithm;
  key: string;
};
let jwtSecret: JwtSecret;
try {
  jwtSecret = JSON.parse(HASURA_GRAPHQL_JWT_SECRET!!);
} catch (error) {
  console.error("[JWT], HASURA_GRAPHQL_JWT_SECRET is not a valid json");
}

export function generateJwtToken(user: LoginQueryUserResponse): string {
  const user_roles = user.roles.map((role) => {
    return role.role;
  });
  if (!user_roles.includes(user.default_role)) {
    user_roles.push(user.default_role);
  }
  return jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": user_roles,
        "x-hasura-default-role": user.default_role,
        "x-hasura-user-id": user.id.toString(),
        "x-hasura-user-name": user.name,
      },
    },
    jwtSecret.key,
    {
      algorithm: jwtSecret.type,
      expiresIn: `${JWT_TOKEN_EXPIRES}m`,
    }
  );
}
