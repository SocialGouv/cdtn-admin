import {
  cacheExchange,
  createClient,
  fetchExchange,
  gql as gqlHelper,
} from "@urql/core";
import fetch from "isomorphic-unfetch";

type GqlClientParameter = {
  graphqlEndpoint: string;
  adminSecret: string;
};

const defaultProps: GqlClientParameter = {
  graphqlEndpoint:
    process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
  adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "admin1",
};

export const gqlClient = (props = defaultProps) =>
  createClient({
    fetch,
    fetchOptions: {
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": props.adminSecret,
      },
    },
    maskTypename: true,
    requestPolicy: "network-only",
    url: props.graphqlEndpoint,
    exchanges: [cacheExchange, fetchExchange],
  });

export type GqlClient = ReturnType<typeof gqlClient>;

export const gql = gqlHelper;
