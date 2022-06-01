import { decode } from "jsonwebtoken";
import jsCookie from "js-cookie";
import nextCookies from "next-cookies";

import { USER_ROLE } from "../constants";

const ANOMNYMOUS_RESPONSE = {
  data: null,
  isAuthenticated: false,
  token: null,
};

export default async function getMe(ctx) {
  const { jwt } = ctx === undefined ? jsCookie.get() : nextCookies(ctx);

  if (typeof jwt !== "string") return ANOMNYMOUS_RESPONSE;

  try {
    const token = decode(jwt);
    if (token) {
      const claims = token["https://hasura.io/jwt/claims"];
      if (claims) {
        return {
          data: {
            name: claims["x-hasura-user-name"],
            role: claims["x-hasura-default-role"],
            agreements: [],
            id: claims["x-hasura-user-id"],
          },
          isAdmin: [
            USER_ROLE.ADMINISTRATOR,
            USER_ROLE.REGIONAL_ADMINISTRATOR,
          ].includes(claims["x-hasura-default-role"]),
          isAuthenticated: true,
          token: token,
        };
      }
    }
    return ANOMNYMOUS_RESPONSE;
  } catch (err) {
    return { ...ANOMNYMOUS_RESPONSE, err };
  }
}
