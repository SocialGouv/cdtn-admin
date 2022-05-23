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
  console.log("Get Me");
  const { jwt } = ctx === undefined ? jsCookie.get() : nextCookies(ctx);

  if (typeof jwt !== "string") return ANOMNYMOUS_RESPONSE;

  try {
    console.log("Get Me JWT: ", jwt);
    const token = decode(jwt);
    console.log("Get Me token: ", token);
    if (token) {
      const claims = token["https://hasura.io/jwt/claims"];
      console.log("Get Me Claims: ", claims);
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
          ].includes(claims["x-hasura-allowed-roles"]),
          isAuthenticated: true,
          token: token,
        };
      }
    }
    return ANOMNYMOUS_RESPONSE;
  } catch (err) {
    console.error(`[libs/getMe()] Error: ${err.message}`);

    return { ...ANOMNYMOUS_RESPONSE, err };
  }
}
