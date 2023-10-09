import Boom from "@hapi/boom";
import { z } from "zod";
import { client } from "@shared/graphql-client";
import { verify } from "argon2";
import { createErrorFor } from "src/lib/apiError";
import { generateJwtToken } from "src/lib/auth/jwt";
import { setJwtCookie } from "src/lib/auth/setJwtCookie";
import { getExpiryDate } from "src/lib/duration";

import { loginQuery, refreshTokenMutation } from "./login.gql";

import { JWT_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "../../config";

export default async function login(req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }
  // validate username and password
  const schema = z.object({
    password: z.string(),
    username: z.string(),
  });

  const { error, data: value } = schema.safeParse(req.body);

  if (error) {
    console.error(error);
    return apiError(Boom.badRequest(error.details[0].message));
  }

  const { username, password } = value;

  const loginResult = await client
    .query(loginQuery, {
      username,
    })
    .toPromise();

  console.log(loginResult);

  if (loginResult.error) {
    console.error(loginResult.error);
    return apiError(Boom.serverUnavailable("login error"));
  }

  if (loginResult.data.users?.length === 0) {
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

  console.log(user);

  const jwt_token = generateJwtToken(user);

  console.log(jwt_token);

  const refreshTokenResult = await client
    .mutation(refreshTokenMutation, {
      refresh_token_data: {
        expires_at: getExpiryDate(REFRESH_TOKEN_EXPIRES),
        user_id: user.id,
      },
    })
    .toPromise();

  console.log(refreshTokenResult);

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
    jwt_token_expiry: getExpiryDate(JWT_TOKEN_EXPIRES, 10),
    refresh_token,
  });
}
