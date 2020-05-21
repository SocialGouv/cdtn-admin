import { createClient } from "urql";

const HASURA_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
const HASURA_GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;

export const client = new createClient({
  url: HASURA_GRAPHQL_ENDPOINT,
  requestPolicy: "network-only",
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
    },
  },
});
