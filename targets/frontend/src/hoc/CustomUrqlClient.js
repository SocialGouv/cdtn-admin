import { cacheExchange, dedupExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";

import { authExchange } from "src/lib/auth/authTokenExchange";

export const withCustomUrqlClient = (Component) =>
  withUrqlClient((ssrExchange, ctx) => {
    const url = ctx?.req
      ? `${process.env.FRONTEND_URL}/api/graphql`
      : `/api/graphql`;
    console.log("[ withUrqlClient ]", ctx?.req ? "server" : "client", url);
    return {
      url,
      exchanges: [
        process.env.NODE_ENV !== "production"
          ? require("@urql/devtools").devtoolsExchange
          : null,
        dedupExchange,
        cacheExchange,
        ssrExchange,
        authExchange(ctx),
        fetchExchange,
      ].filter(Boolean),
    };
  })(Component);
