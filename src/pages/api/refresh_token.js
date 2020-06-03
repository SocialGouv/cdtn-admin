import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { setRefreshTokenCookie } from "src/lib/setRefreshTokenCookie";
import { createErrorFor } from "src/lib/apiError";
import { getExpiryDate } from "src/lib/duration";
import { client } from "src/lib/graphqlApiClient";
import { generateJwtToken } from "src/lib/jwt";
import { v4 as uuidv4 } from "uuid";
import {
  deletePreviousRefreshTokenMutation,
  getRefreshTokenQuery,
} from "./refreshToken.gql";
import { refreshToken } from "src/lib/auth";

export default async function refresh_token(req, res) {
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

  if (error) {
    return apiError(Boom.badRequest(error.details[0].message));
  }
  let result;
  try {
    result = await client
      .query(getRefreshTokenQuery, {
        refresh_token: value.refresh_token,
        current_timestampz: new Date(),
      })
      .toPromise();
  } catch (e) {
    console.error(e);
    console.error("Error connecting to GraphQL");
    return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }
  console.log(
    "[api/refresh_token]",
    { refreshToken: value.refresh_token },
    result.data.refresh_tokens
  );

  if (result.data.refresh_tokens.length === 0) {
    console.error("Incorrect user id or refresh token", refresh_token);
    return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  const { user } = result.data[`refresh_tokens`][0];

  const new_refresh_token = uuidv4();

  console.log("[ /api/refresh_token ]", "replace", {
    refresh_token,
    new_refresh_token,
  });

  try {
    await client
      .query(deletePreviousRefreshTokenMutation, {
        old_refresh_token: refresh_token,
        new_refresh_token_data: {
          user_id: user.id,
          refresh_token: new_refresh_token,
          expires_at: getExpiryDate(process.env.REFRESH_TOKEN_EXPIRES),
        },
      })
      .toPromise();
  } catch (e) {
    console.error(e);
    console.error("unable to create new refresh token and delete old");
    return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }
  const jwt_token = generateJwtToken(user);

  setRefreshTokenCookie(res, new_refresh_token);

  res.json({
    refresh_token: new_refresh_token,
    user_id: user.id,
    jwt_token,
    jwt_token_expiry: getExpiryDate(
      parseInt(process.env.JWT_TOKEN_EXPIRES, 10) || 15
    ),
  });
}
