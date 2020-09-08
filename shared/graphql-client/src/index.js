import fetch from "isomorphic-unfetch";
import { createClient } from "@urql/core";

const HASURA_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
const HASURA_GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;

export const client = createClient({
  url: HASURA_GRAPHQL_ENDPOINT,
  requestPolicy: "network-only",
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
    },
  },
  fetch,
});
