import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { verify } from "argon2";
import { createErrorFor } from "src/lib/apiError";
import { generateJwtToken } from "src/lib/auth/jwt";
import { setJwtCookie } from "src/lib/auth/setJwtCookie";
import { getExpiryDate } from "src/lib/duration";

import { loginQuery, refreshTokenMutation } from "./login.gql";

const { REFRESH_TOKEN_EXPIRES = "", JWT_TOKEN_EXPIRES = "" } = process.env;

export default async function login(req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }
  // validate username and password
  const schema = Joi.object({
    password: Joi.string().required(),
    username: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

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
    return apiError(Boom.unauthorized("User deleted."));
  }

  // see if password hashes matches
  const match = await verify(user.password, password);

  if (!match) {
    console.error("Password does not match");
    return apiError(Boom.unauthorized("Invalid 'username' or 'password'"));
  }

  const jwt_token = generateJwtToken(user);
  const refreshTokenResult = await client
    .mutation(refreshTokenMutation, {
      refresh_token_data: {
        expires_at: getExpiryDate(parseInt(REFRESH_TOKEN_EXPIRES, 10)),
        user_id: user.id,
      },
    })
    .toPromise();

  if (refreshTokenResult.error) {
    return apiError(
      Boom.badImplementation(
        "Could not update 'refresh token' for user",
        username
      )
    );
  }

  console.log("[login]", user.id);
  const { refresh_token } = refreshTokenResult.data.insert_data.returning[0];

  setJwtCookie(res, refresh_token, jwt_token);

  res.json({
    jwt_token,
    jwt_token_expiry: getExpiryDate(parseInt(JWT_TOKEN_EXPIRES, 10) || 15),
    refresh_token,
  });
}
