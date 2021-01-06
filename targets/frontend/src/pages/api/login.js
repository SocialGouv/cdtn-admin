import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { verify } from "argon2";
import { createErrorFor } from "src/lib/apiError";
import { generateJwtToken } from "src/lib/auth/jwt";
import { setRefreshTokenCookie } from "src/lib/auth/setRefreshTokenCookie";
import { getExpiryDate } from "src/lib/duration";

import { loginQuery, refreshTokenMutation } from "./login.gql";

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

  let result = await client
    .query(loginQuery, {
      username,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    return apiError(Boom.serverUnavailable("login error"));
  }

  if (result.data.users?.length === 0) {
    console.error("No user with 'username'", username);
    return apiError(Boom.unauthorized("Invalid 'username' or 'password'"));
  }

  // check if we got any user back
  const user = result.data[`users`][0];

  if (!user.active) {
    // console.error('User not activated');
    return apiError(Boom.unauthorized("User not activated."));
  }

  // see if password hashes matches
  const match = await verify(user.password, password);

  if (!match) {
    console.error("Password does not match");
    return apiError(Boom.unauthorized("Invalid 'username' or 'password'"));
  }

  const jwt_token = generateJwtToken(user);
  result = await client
    .query(refreshTokenMutation, {
      refresh_token_data: {
        expires_at: getExpiryDate(
          parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES, 10)
        ),
        user_id: user.id,
      },
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    return apiError(
      Boom.badImplementation(
        "Could not update 'refresh token' for user",
        username
      )
    );
  }

  console.log("[login]", user.id);
  const { refresh_token } = result.data.insert_data.returning[0];

  setRefreshTokenCookie(res, refresh_token);

  res.json({
    jwt_token,
    jwt_token_expiry: getExpiryDate(
      parseInt(process.env.JWT_TOKEN_EXPIRES, 10) || 15
    ),
    refresh_token,
  });
}
