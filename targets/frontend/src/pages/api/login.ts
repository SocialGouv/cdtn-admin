import Boom from "@hapi/boom";
import * as z from "zod";
import { client } from "@shared/graphql-client";
import { verify } from "argon2";
import { createErrorFor } from "src/lib/apiError";
import { generateJwtToken } from "src/lib/auth/jwt";
import { setJwtCookie } from "src/lib/auth/setJwtCookie";
import { getExpiryDate } from "src/lib/duration";

import {
  loginQuery,
  LoginQueryResponse,
  LoginQueryVariables,
  refreshTokenMutation,
  RefreshTokenMutationResponse,
  RefreshTokenMutationVariables,
} from "./login.gql";
import { NextApiRequest, NextApiResponse } from "next";

const { REFRESH_TOKEN_EXPIRES = "", JWT_TOKEN_EXPIRES = "" } = process.env;

export const loginInputSchema = z.object({
  password: z.string(),
  username: z.string(),
});

export type LoginResponse = {
  jwt_token: string;
  jwt_token_expiry: Date;
  refresh_token: string;
};
export default async function login(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const query = loginInputSchema.safeParse(req.body);

  if (!query.success) {
    console.error(query.error.format());
    return apiError(Boom.badRequest(query.error.message));
  }

  const { username, password } = query.data;

  const loginResult = await client
    .query<LoginQueryResponse, LoginQueryVariables>(loginQuery, {
      username,
    })
    .toPromise();

  if (loginResult.error) {
    console.error(loginResult.error);
    return apiError(Boom.serverUnavailable("login error"));
  }

  if (!loginResult.data || loginResult.data.users?.length === 0) {
    console.error("No user with 'username'", username);
    return apiError(Boom.unauthorized("Invalid 'username' or 'password'"));
  }

  // check if we got any user back
  const user = loginResult.data[`users`][0];

  if (!user.active) {
    return apiError(Boom.unauthorized("User not activated."));
  }

  if (user.deleted) {
    return apiError(Boom.unauthorized("Invalid 'username' or 'password'"));
  }

  // see if password hashes matches
  const match = await verify(user.password, password);

  if (!match) {
    console.error("Password does not match");
    return apiError(Boom.unauthorized("Invalid 'username' or 'password'"));
  }

  const jwt_token = generateJwtToken(user);
  const refreshTokenResult = await client
    .mutation<RefreshTokenMutationResponse, RefreshTokenMutationVariables>(
      refreshTokenMutation,
      {
        refresh_token_data: {
          expires_at: getExpiryDate(parseInt(REFRESH_TOKEN_EXPIRES, 10)),
          user_id: user.id,
        },
      }
    )
    .toPromise();

  const refresh_token =
    refreshTokenResult.data?.insert_data.returning[0].refresh_token;

  if (refreshTokenResult.error || !refresh_token) {
    return apiError(
      Boom.badImplementation(
        "Could not update 'refresh token' for user",
        username
      )
    );
  }

  setJwtCookie(res, refresh_token, jwt_token);

  res.json({
    jwt_token,
    jwt_token_expiry: getExpiryDate(parseInt(JWT_TOKEN_EXPIRES, 10) || 15),
    refresh_token,
  });
}
