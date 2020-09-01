import { createClient } from "urql";

export function getConnectedUser(jwt_token) {
  createClient({
    fetchOptions: {
      headers: {
        authorization: `bearer ${jwt_token}`,
      },
    },
    requestPolicy: "cache-and-network",
    url: `${process.env.FRONTEND_URL}/graphql`,
  });
}
