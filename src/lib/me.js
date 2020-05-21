import { createClient } from "urql";

export function getConnectedUser(jwt_token) {
  createClient({
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/graphql`,
    requestPolicy: "cache-and-network",
    fetchOptions: {
      headers: {
        authorization: `bearer ${jwt_token}`,
      },
    },
  });
}
