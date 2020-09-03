import { getDisplayName } from "next/dist/next-server/lib/utils";
import PropTypes from "prop-types";
import React, { createContext } from "react";

import { getToken, getUser, refreshToken, setToken } from "../lib/auth/token";

const userPropType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.string),
});

export const UserContext = createContext({
  user: null,
});

export const UserProvider = ({ children, user }) => {
  console.log("[userprovider]", user);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
  user: userPropType,
};

function withUserProvider(WrappedComponent) {
  return class extends React.Component {
    static displayName = `withUserProvider(${getDisplayName(
      WrappedComponent
    )})`;

    static propTypes = {
      user: userPropType,
    };

    static async getInitialProps(ctx) {
      const token = getToken();
      let user = null;
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
      user = getUser();

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));
      return { ...componentProps, user };
    }
    render() {
      console.log("---- withUserProvider");
      return (
        <UserProvider user={this.props.user}>
          <WrappedComponent {...this.props} />
        </UserProvider>
      );
    }
  };
}

export { withUserProvider };
