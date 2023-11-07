import { client } from "@shared/graphql-client";
import {
  deletePreviousRefreshTokenMutation,
  getRefreshTokenQuery,
} from "../../pages/api/refresh_token.gql";
import { v4 as uuidv4 } from "uuid";
import { REFRESH_TOKEN_EXPIRES } from "../../config";
import { getExpiryDate } from "src/lib/duration";
import { generateJwtToken } from "src/lib/auth/jwt";

/*
type Input = {
  refresh_token: string;
};

type Output = {
  jwt_token: any;
  new_refresh_token: string;
};
*/
export const refreshToken = async (value) => {
  console.log("[refresh_token.ts] refreshToken");

  const { refresh_token } = value;

  let resultRefreshToken = await client
    .query(getRefreshTokenQuery, {
      current_timestampz: new Date(),
      refresh_token,
    })
    .toPromise();

  if (resultRefreshToken.error) {
    console.error(resultRefreshToken.error);
    throw new Error("Invalid 'refresh_token'");
    // return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  if (resultRefreshToken.data.refresh_tokens.length === 0) {
    console.error("Incorrect user id or refresh token", refresh_token);
    throw new Error("Invalid 'refresh_token'");
    // return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  const { user } = resultRefreshToken.data[`refresh_tokens`][0];

  const new_refresh_token = uuidv4();

  let result = await client
    .mutation(deletePreviousRefreshTokenMutation, {
      new_refresh_token_data: {
        expires_at: getExpiryDate(REFRESH_TOKEN_EXPIRES),
        refresh_token: new_refresh_token,
        user_id: user.id,
      },
      old_refresh_token: refresh_token,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error("Invalid 'refresh_token'");
    // return apiError(Boom.unauthorized("Invalid 'refresh_token'"));
  }

  const jwt_token = generateJwtToken(user);

  return {
    jwt_token,
    new_refresh_token,
  };
};
