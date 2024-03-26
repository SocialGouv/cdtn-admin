import { getSession, signOut, useSession } from "next-auth/react";
import { mapExchange } from "urql";
import { authExchange } from "@urql/exchange-auth";
import { generateNewAccessToken } from "./generateAccessToken";

export const mapExchangeUrql = mapExchange({
  onError(error) {
    const isAuthError = error.graphQLErrors.some(
      (e) => e.extensions?.code === "FORBIDDEN"
    );
    if (isAuthError) {
      signOut();
    }
  },
});

export const authExchangeUrql = authExchange(async (utils) => {
  const session = await getSession();
  const accessToken = session?.user.accessToken;
  const refreshToken = session?.user.refreshToken;

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
      // e.g. check for expiration, existence of auth etc
      return !accessToken;
    },
    didAuthError(error, _operation) {
      return error.graphQLErrors.some(
        (e) => e.extensions?.code === "FORBIDDEN"
      );
    },
    async refreshAuth() {
      try {
        if (!accessToken || !refreshToken) {
          throw new Error("No accessToken or refreshToken found");
        }
        const newAccessToken = await generateNewAccessToken(
          accessToken,
          refreshToken
        );
      } catch (error) {
        console.error(error);
        signOut();
      }
    },
  };
});
