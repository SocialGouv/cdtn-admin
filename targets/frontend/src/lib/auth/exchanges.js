import { errorExchange, makeOperation } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { auth } from "src/lib/auth/token";

import { request } from "../request";

export function customAuthExchange(ctx) {
  return authExchange({
    addAuthToOperation: function addAuthToOperation({ authState, operation }) {
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
      const result = await auth(ctx);
      if (result?.jwt_token) {
        // return the new tokens
        return { token: result.jwt_token };
      }

      return null;
    },

    willAuthError: ({ authState }) => {
      // e.g. check for expiration, existence of auth etc
      if (!authState) return true;
      return false;
    },
  });
}

export function customErrorExchange() {
  return errorExchange({
    onError: (error) => {
      const { graphQLErrors } = error;
      // we only get an auth error here when the auth exchange had attempted to refresh auth and getting an auth error again for the second time
      const isAuthError = graphQLErrors.some(
        (e) => e.extensions?.code === "invalid-jwt"
      );
      if (isAuthError) {
        // clear storage, log the user out etc
        // your app logout logic should trigger here
        console.log("errorExchange", "logout");
        request("/api/logout", {
          credentials: "include",
          mode: "same-origin",
        });
      }
    },
  });
}
