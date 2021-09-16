import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { createErrorFor } from "src/lib/apiError";
import { generateJwtToken } from "src/lib/auth/jwt";
import { setRefreshTokenCookie } from "src/lib/auth/setRefreshTokenCookie";
import { getExpiryDate } from "src/lib/duration";
import { v4 as uuidv4 } from "uuid";

import {
  deletePreviousRefreshTokenMutation,
  getRefreshTokenQuery,
} from "./refresh_token.gql";

export default async function refreshToken(req, res) {
  const apiError = createErrorFor(res);
  const schema = Joi.object({
    refresh_token: Joi.string().guid({ version: "uuidv4" }).required(),
  }).unknown();

  let { error, value } = schema.validate(req.query);

  if (error) {
    const temp = schema.validate(req.body);
    error = temp.error;
    value = temp.value;
  }

  if (error) {
    const temp = schema.validate(req.cookies);
    error = temp.error;
    value = temp.value;
  }

  const { refresh_token } = value;

  if (error) {
    return apiError(Boom.badRequest(error.details[0].message));
  }
  let result = await client
    .query(getRefreshTokenQuery, {
      current_timestampz: new Date(),
      refresh_token,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  if (result.data.refresh_tokens.length === 0) {
    console.error("Incorrect user id or refresh token", refresh_token);
    return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  const { user } = result.data[`refresh_tokens`][0];

  const new_refresh_token = uuidv4();

  console.log("[ /api/refresh_token ]", "replace", {
    new_refresh_token,
    refresh_token,
  });

  result = await client
    .mutation(deletePreviousRefreshTokenMutation, {
      new_refresh_token_data: {
        expires_at: getExpiryDate(
          parseInt(process.env.REFRESH_TOKEN_EXPIRES, 10)
        ),
        refresh_token: new_refresh_token,
        user_id: user.id,
      },
      old_refresh_token: refresh_token,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  const jwt_token = generateJwtToken(user);

  setRefreshTokenCookie(res, new_refresh_token);

  res.json({
    jwt_token,
    jwt_token_expiry: getExpiryDate(
      parseInt(process.env.JWT_TOKEN_EXPIRES, 10) || 15
    ),
    refresh_token: new_refresh_token,
  });
}
