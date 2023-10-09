import { withUrqlClient } from "next-urql";
import {
  customAuthExchange,
  customErrorExchange,
} from "src/lib/auth/exchanges";
import { cacheExchange, dedupExchange, fetchExchange } from "urql";

export const withCustomUrqlClient = (Component) =>
  withUrqlClient(
    (ssrExchange, ctx) => {
      const baseUrl = process.env.FRONTEND_HOST
        ? `https://${process.env.FRONTEND_HOST}`
        : `http://localhost:3000`;
      const isServer = ctx && ctx.req;
      const url = isServer ? `${baseUrl}/api/graphql` : "/api/graphql";
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
