import { makeOperation } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { withUrqlClient } from "next-urql";
import { auth, getToken, isTokenExpired, setToken } from "src/lib/auth/token";
import { request } from "src/lib/request";
// import { authExchange } from "src/lib/auth/authTokenExchange";
import {
  cacheExchange,
  dedupExchange,
  errorExchange,
  fetchExchange,
} from "urql";

export const withCustomUrqlClient = (Component) =>
  withUrqlClient((ssrExchange, ctx) => {
    const url = ctx?.req
      ? `${process.env.FRONTEND_URL}/api/graphql`
      : `/api/graphql`;
    console.log(
      "[ withUrqlClient ]",
      ctx?.pathname,
      ctx?.req ? "server" : "client",
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
        errorExchange({
          onError: (error) => {
            const { graphQLErrors } = error;
            // we only get an auth error here when the auth exchange had attempted to refresh auth and getting an auth error again for the second time
            const isAuthError = graphQLErrors.some(
              (e) => e.extensions?.code === "invalid-jwt"
            );
            if (isAuthError) {
              // clear storage, log the user out etc
              // your app logout logic should trigger here
              request("/api/logout", {
                credentials: "include",
                mode: "same-origin",
              });
            }
          },
        }),
        authExchange({
          addAuthToOperation: function addAuthToOperation({
            authState,
            operation,
          }) {
            console.log("addAuthToOperation", { authState });
            if (!authState?.token) {
              return operation;
            }
            const fetchOptions =
              typeof operation.context.fetchOptions === "function"
                ? operation.context.fetchOptions()
                : operation.context.fetchOptions || {};

            return makeOperation(operation.kind, operation, {
              ...operation.context,
              fetchOptions: {
                ...fetchOptions,
                headers: {
                  ...fetchOptions.headers,
                  Authorization: `Bearer ${authState.token}`,
                },
              },
            });
          },
          didAuthError: ({ error }) => {
            // check if the error was an auth error (this can be implemented in various ways, e.g. 401 or a special error code)
            return error.graphQLErrors.some(
              (e) => e.extensions?.code === "invalid-jwt"
            );
          },
          getAuth: async ({ authState }) => {
            // for initial launch, fetch the auth state from storage (local storage, async storage etc)
            console.log("getAuth", { authState });
            if (!authState) {
              const token = getToken() || (await auth(ctx));
              if (token) {
                return { token: token.jwt_token };
              }
              return null;
            }

            /**
             * the following code gets executed when an auth error has occurred
             * we should refresh the token if possible and return a new auth state
             * If refresh fails, we should log out
             **/

            // if your refresh logic is in graphQL, you must use this mutate function to call it
            // if your refresh logic is a separate RESTful endpoint, use fetch or similar
            setToken(null);
            const result = await auth(ctx);
            console.log({ result });
            if (result?.jwt_token) {
              // return the new tokens
              return { token: result.jwt_token };
            }

            return null;
          },

          willAuthError: ({ authState }) => {
            console.log("willAuthError", !authState || isTokenExpired());
            if (!authState || isTokenExpired()) return true;
            // e.g. check for expiration, existence of auth etc
            return false;
          },
        }),
        fetchExchange,
      ].filter(Boolean),
      requestPolicy: "cache-first",
      url,
    };
  })(Component);
