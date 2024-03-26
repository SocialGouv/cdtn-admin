import { getSession, signOut } from "next-auth/react";
import { authExchange } from "@urql/exchange-auth";

export const authExchangeUrql = authExchange(async (utils) => {
  const session = await getSession();
  let accessToken = session?.user.accessToken;

  return {
    addAuthToOperation(operation) {
      if (accessToken) {
        return utils.appendHeaders(operation, {
          Authorization: `Bearer ${accessToken}`,
        });
      }
      return operation;
    },
    willAuthError(_operation) {
      return !accessToken;
    },
    didAuthError(error, _operation) {
      return error.graphQLErrors.some(
        (e) =>
          e.extensions?.code === "validation-failed" ||
          e.extensions?.code === "invalid-jwt"
      );
    },
    async refreshAuth() {
      try {
        const session = await getSession();
        if (!session) {
          throw new Error("No session");
        }
        accessToken = session.user.accessToken;
      } catch (error) {
        console.error(error);
        signOut({
          redirect: true,
          callbackUrl: "/login",
        });
      }
    },
  };
});
