import { decode } from "jsonwebtoken";
import PropTypes from "prop-types";
import React, { createContext } from "react";
import { getDisplayName } from "src/hoc/getDisplayName";
import { auth } from "src/lib/auth/token";
import { request } from "src/lib/request";

export const UserContext = createContext({});

export function withUserProvider(WrappedComponent) {
  return class extends React.Component {
    static displayName = `withUserProvider(${getDisplayName(
      WrappedComponent
    )})`;

    static propTypes = {
      tokenData: PropTypes.object,
    };

    static async getInitialProps(ctx) {
      console.log("[getInitialProps]");
      const token = await auth(ctx);

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));

      return {
        ...componentProps,
        tokenData: token ? decode(token.jwt_token) : null,
      };
    }
    render() {
      return (
        <ProvideUser tokenData={this.props.tokenData}>
          <WrappedComponent {...this.props} />
        </ProvideUser>
      );
    }
  };
}

export const ProvideUser = ({ children, tokenData }) => {
  let user = null;
  if (tokenData) {
    const claims = tokenData["https://hasura.io/jwt/claims"];
    if (claims) {
      user = {
        id: claims["x-hasura-user-id"],
        name: claims["x-hasura-user-name"],
        roles: claims["x-hasura-allowed-roles"],
      };
    }
  }

  async function logout() {
    try {
      await request("/api/logout", {
        credentials: "include",
        mode: "same-origin",
      });
    } catch (error) {
      console.error("[ client logout ] failed", error);
    }
    window.location = "/login";
  }
  const isAuth = Boolean(user);
  const isAdmin = user?.roles.includes("admin");
  // console.log({ provideUser: user });
  return (
    <UserContext.Provider value={{ isAdmin, isAuth, logout, user }}>
      {children}
    </UserContext.Provider>
  );
};

ProvideUser.propTypes = {
  children: PropTypes.node.isRequired,
  tokenData: PropTypes.object,
};
