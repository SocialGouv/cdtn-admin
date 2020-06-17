/**
 * using require syntax  here because graphqlClient is alos used
 * within the nodejs scripts
 */
require("isomorphic-unfetch");
const { createClient } = require("urql");

const HASURA_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
const HASURA_GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;

const client = createClient({
  url: HASURA_GRAPHQL_ENDPOINT,
  requestPolicy: "network-only",
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
    },
  },
});
module.exports = { client };
