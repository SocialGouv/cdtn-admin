import { getSession, signOut } from "next-auth/react";
import { authExchange } from "@urql/exchange-auth";

/**
 * During `next build` (SSG), code can run in a Node context.
 * Calling `getSession()` there triggers a fetch to `/api/auth/session` (localhost)
 * which fails and pollutes the build output.
 */
const isBrowser = typeof window !== "undefined";

export const authExchangeUrql = authExchange(async (utils) => {
  const session = isBrowser ? await getSession() : null;
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
      // On server (SSG/SSR) we don't want to block requests nor attempt to fetch a session.
      if (!isBrowser) return false;
      return !accessToken;
    },
    didAuthError(error, _operation) {
      return error.graphQLErrors.some(
        (e) =>
          e.extensions?.code === "validation-failed" ||
          e.extensions?.code === "invalid-jwt" ||
          e.extensions?.code === "jwt-invalid-claims"
      );
    },
    async refreshAuth() {
      // Prevent server-side fetches during build.
      if (!isBrowser) return;

      try {
        const session = await getSession();
        if (!session) {
          throw new Error("No session");
        }
        accessToken = session.user.accessToken;
      } catch (_error) {
        signOut({
          redirect: true,
          callbackUrl: "/login",
        });
      }
    },
  };
});
