import { withUrqlClient } from "next-urql";
import {
  customAuthExchange,
  customErrorExchange,
} from "src/lib/auth/exchanges";
import { cacheExchange, dedupExchange, fetchExchange } from "urql";

export const withCustomUrqlClient = (Component) =>
  withUrqlClient(
    (ssrExchange, ctx) => {
      const url = ctx?.req
        ? `http://localhost:3000/api/graphql`
        : `/api/graphql`;
      console.log(
        "[ withUrqlClient ]",
        ctx ? (ctx?.req ? "server" : "client") : "no ctx",
        ctx?.pathname,
        url
      );
      return {
        exchanges: [
          process.env.NODE_ENV !== "production"
            ? require("@urql/devtools").devtoolsExchange
            : null,
          dedupExchange,
          cacheExchange,
          ssrExchange,
          customErrorExchange(),
          customAuthExchange(ctx),
          fetchExchange,
        ].filter(Boolean),
        requestPolicy: "cache-first",
        url,
      };
    },
    { ssr: true }
  )(Component);
