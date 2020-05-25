import { dedupExchange, cacheExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";
import { refreshToken } from "src/lib/auth";
import { authExchange } from "src/lib/authTokenExchange";
export const withCustomUrqlClient = (Component) =>
  withUrqlClient(
    (ctx) => {
      return {
        url:
          ctx && ctx.req
            ? `http://localhost:${process.env.PORT}/api/graphql`
            : "/api/graphql",
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
