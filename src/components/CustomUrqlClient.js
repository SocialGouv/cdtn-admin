import { cacheExchange, dedupExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";
import { refreshToken } from "src/lib/auth";
import { authExchange } from "src/lib/authTokenExchange";
export const withCustomUrqlClient = (Component) =>
  withUrqlClient(
    (ctx) => {
      const url = ctx?.req
        ? `http://localhost:${process.env.PORT}/api/graphql`
        : `/api/graphql`;
      console.log("[ withUrqlClient ]", { url });
      return {
        url,
        fetchOptions: {
          refreshToken: () => refreshToken(ctx),
        },
      };
    },
    (ssrExchange) => [
      dedupExchange,
      cacheExchange,
      ssrExchange,
      authExchange,
      // tapExchange((op) => console.log("tap", op.operationName)),
      fetchExchange,
    ]
  )(Component);
