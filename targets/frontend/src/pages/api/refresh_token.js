import Boom from "@hapi/boom";
import { z } from "zod";
import { client } from "@shared/graphql-client";
import { createErrorFor } from "src/lib/apiError";
import { generateJwtToken } from "src/lib/auth/jwt";
import { setJwtCookie } from "src/lib/auth/setJwtCookie";
import { getExpiryDate } from "src/lib/duration";
import { v4 as uuidv4 } from "uuid";
import { REFRESH_TOKEN_EXPIRES, JWT_TOKEN_EXPIRES } from "../../config";

import {
  deletePreviousRefreshTokenMutation,
  getRefreshTokenQuery,
} from "./refresh_token.gql";

export default async function refreshToken(req, res) {
  const apiError = createErrorFor(res);
  const schema = z.object({
    refresh_token: z.string().uuid(),
  });

  let { error, data: value } = schema.safeParse(req.query);

  if (error) {
    const temp = schema.safeParse(req.body);
    error = temp.error;
    value = temp.data;
  }

  if (error) {
    const temp = schema.safeParse(req.cookies);
    error = temp.error;
    value = temp.data;
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
        expires_at: getExpiryDate(parseInt(REFRESH_TOKEN_EXPIRES, 10)),
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

  setJwtCookie(res, new_refresh_token, jwt_token);

  res.json({
    jwt_token,
    jwt_token_expiry: getExpiryDate(parseInt(JWT_TOKEN_EXPIRES, 10) || 15),
    refresh_token: new_refresh_token,
  });
}
