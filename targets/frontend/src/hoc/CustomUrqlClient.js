import { withUrqlClient } from "next-urql";
import {
  customAuthExchange,
  customErrorExchange,
} from "src/lib/auth/exchanges";
import { dedupExchange, fetchExchange } from "@urql/core";
import { cacheExchange } from "@urql/exchange-graphcache";
import schema from "./schema.json";

export const withCustomUrqlClient = (Component) =>
  withUrqlClient(
    (ssrExchange, ctx) => {
      const url = ctx?.req
        ? `${process.env.FRONTEND_URL}/api/graphql`
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
          cacheExchange({ schema }),
          ssrExchange,
          customErrorExchange(),
          customAuthExchange(ctx),
          dedupExchange,
          fetchExchange,
        ].filter(Boolean),
        requestPolicy: "cache-first",
        url,
      };
    },
    { ssr: true }
  )(Component);
