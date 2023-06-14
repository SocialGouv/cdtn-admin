import { SSRExchange, withUrqlClient } from "next-urql";
import {
  customAuthExchange,
  customErrorExchange,
} from "src/lib/auth/exchanges";
import { cacheExchange, dedupExchange, fetchExchange } from "urql";
import { NextPageContext } from "next";

export const withCustomUrqlClient = (Component: any) =>
  withUrqlClient(
    (ssrExchange: SSRExchange, ctx: NextPageContext | undefined) => {
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
