import { createClient, Client } from "@urql/core";
import fetch from "isomorphic-unfetch";

const HASURA_GRAPHQL_ADMIN_SECRET =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "admin1";
const HASURA_GRAPHQL_ENDPOINT =
  process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql";

export const client: Client = createClient({
  fetch,
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
    },
  },
  requestPolicy: "network-only",
  url: HASURA_GRAPHQL_ENDPOINT,
});

export * from "@urql/core";
