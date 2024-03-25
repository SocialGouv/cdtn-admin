import { errorExchange, makeOperation } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";

import { getSession, signOut } from "next-auth/react";

export function customAuthExchange(ctx: any) {
  const isServer = ctx && ctx.req;

  return authExchange({
    addAuthToOperation: function addAuthToOperation({
      authState,
      operation,
    }: any) {
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
      return error.graphQLErrors.some(
        (e) => e.extensions?.code === "invalid-jwt"
      );
    },

    getAuth: async () => {
      if (!isServer) {
        // get auth from nextjs next-auth react
        const session = await getSession();
        if (session) {
          return { token: session.user.accessToken };
        }
      } else {
        // get auth from nextjs server
        const session = await getSession({ req: ctx.req });
        if (session) {
          return { token: session.user.accessToken };
        }
      }
      return null;
    },

    willAuthError: ({ authState }) => {
      if (!authState) return true;
      return false;
    },
  });
}

export function customErrorExchange(ctx: any) {
  const isServer = ctx && ctx.req;

  return errorExchange({
    onError: (error) => {
      const { graphQLErrors } = error;
      const isAuthError = graphQLErrors.some(
        (e) => e.extensions?.code === "invalid-jwt"
      );
      if (isAuthError && !isServer) {
        signOut();
      }
    },
  });
}
