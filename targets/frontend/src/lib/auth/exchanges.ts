import { errorExchange, makeOperation } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { auth, getToken, isTokenExpired, setToken } from "src/lib/auth/token";

import { request } from "../request";
import { NextPageContext } from "next";
import { Operation, OperationContext } from "urql";

export function customAuthExchange(ctx: NextPageContext | undefined) {
  return authExchange<{ token: string }>({
    addAuthToOperation: ({ authState, operation }) => {
      if (!authState?.token) {
        return operation;
      }
      const fetchOptions =
        typeof operation.context.fetchOptions === "function"
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions || {};

      const fetchOptionsWithBearer: RequestInit = {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${authState.token}`,
        },
      };

      const { _instance, ...oldOperation } = operation.context;
      const context: OperationContext = {
        ...oldOperation,
        preferGetMethod: !!operation.context.preferGetMethod,
        fetchOptions: fetchOptionsWithBearer,
      };
      const newOperation: Operation<any, any> = makeOperation(
        operation.kind,
        operation,
        context
      );
      return newOperation as any;
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
      if (result?.jwt_token) {
        // return the new tokens
        return { token: result.jwt_token };
      }

      return null;
    },

    willAuthError: ({ authState }) => {
      // e.g. check for expiration, existence of auth etc
      return !authState || isTokenExpired();
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
