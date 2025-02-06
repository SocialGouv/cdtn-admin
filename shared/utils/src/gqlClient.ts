import {
  cacheExchange,
  createClient,
  fetchExchange,
  mapExchange,
  gql as gqlHelper,
} from "@urql/core";

type GqlClientParameter = {
  graphqlEndpoint: string;
  adminSecret: string;
};

export const gqlDefaultProps: GqlClientParameter = {
  graphqlEndpoint:
    process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
  adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "admin1",
};

export const gqlClient = (props = gqlDefaultProps) =>
  createClient({
    fetch,
    fetchOptions: {
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": props.adminSecret,
      },
    },
    requestPolicy: "network-only",
    url: props.graphqlEndpoint,
    exchanges: [
      mapExchange({
        onError(error) {
          console.error("URQL ERROR :", JSON.stringify(error));
        },
        onResult(result) {
          return result.operation.kind === "query"
            ? { ...result, data: maskTypename(result.data, true) }
            : result;
        },
      }),
      cacheExchange,
      fetchExchange,
    ],
  });

export type GqlClient = ReturnType<typeof gqlClient>;

export const gql = gqlHelper;

// maskTypename: true => https://github.com/urql-graphql/urql/pull/3299
const maskTypename = (data: any, isRoot?: boolean): any => {
  if (!data || typeof data !== "object") {
    return data;
  } else if (Array.isArray(data)) {
    return data.map((d) => maskTypename(d));
  } else if (
    data &&
    typeof data === "object" &&
    (isRoot || "__typename" in data)
  ) {
    const acc: { [key: string]: any } = {};
    for (const key in data) {
      if (key === "__typename") {
        Object.defineProperty(acc, "__typename", {
          enumerable: false,
          value: data.__typename,
        });
      } else {
        acc[key] = maskTypename(data[key]);
      }
    }
    return acc;
  } else {
    return data;
  }
};
