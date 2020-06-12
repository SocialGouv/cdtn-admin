/**
 * using require syntax  here because graphqlClient is alos used
 * within the nodejs scripts
 */
require("isomorphic-unfetch");
const { createClient } = require("urql");
const assert = require("assert");

export function createClient({ url, secret }) {
  assert(url);
  assert(secret);

  return createClient({
    url: HASURA_GRAPHQL_ENDPOINT,
    requestPolicy: "network-only",
    fetchOptions: {
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
      },
    },
  });
}
