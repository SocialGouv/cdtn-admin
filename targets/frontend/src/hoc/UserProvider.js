import React from "react";
import { getDisplayName } from "next/dist/next-server/lib/utils";

import { getToken, refreshToken, setToken } from "../lib/auth/token";
import { UserProvider } from "../hooks/useUser";

function withUserProvider(WrappedComponent) {
  return class extends React.Component {
    static displayName = `withUserProvider(${getDisplayName(
      WrappedComponent
    )})`;
    static async getInitialProps(ctx) {
      const token = getToken();
      console.log(
        "[withUserProvider] getInitialProps ",
        ctx.pathname,
        ctx.req ? "server" : "client",
        token ? "found token" : "no token"
      );

      // eachtime we render a page on the server
      // we need to set token to null to be sure
      // that will not re-use an old token since
      // token is a global var
      // Once urlq exchange will have access to context
      // we could use context to pass token to urlqclient
      if (ctx?.req) {
        setToken(null);
      }
      if (!token) {
        const newToken = await refreshToken(ctx);
        setToken(newToken);
      }

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));

      return { ...componentProps };
    }
    render() {
      return (
        <UserProvider>
          <WrappedComponent {...this.props} />
        </UserProvider>
      );
    }
  };
}

export { withUserProvider };
