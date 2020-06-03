import { cacheExchange, dedupExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";
import { refreshToken } from "src/lib/auth";
import { authExchange } from "src/lib/authTokenExchange";

export const withCustomUrqlClient = (Component) =>
  withUrqlClient(
    (ctx) => {
      const url = ctx?.req
        ? `${process.env.FRONTEND_URL}/api/graphql`
        : `/api/graphql`;
      console.log("[ withUrqlClient ]", { url });
      return {
        url,
        fetchOptions: {
          refreshToken: () => refreshToken(ctx),
        },
      };
    },
    (ssrExchange) =>
      [
        process.env.NODE_ENV !== "production"
          ? require("@urql/devtools").devtoolsExchange
          : [],
        dedupExchange,
        cacheExchange,
        ssrExchange,
        authExchange,
        // tapExchange((op) => console.log("tap", op.operationName)),
        fetchExchange,
      ].flatMap((a) => a)
  )(Component);
