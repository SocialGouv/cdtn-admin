import React, { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { getToken, setToken, refreshToken, getRawtoken } from "src/lib/auth";
import { useQuery } from "urql";
import { request } from "src/lib/request";
import { getDisplayName } from "next/dist/next-server/lib/utils";

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
});

const getUserQuery = `
query getUser {
  user: users {
    id
    email
    name
    active
    default_role
    roles {
      role
    }
  }
}
`;

export function AuthProvider({ children }) {
  console.log("[AuthProvider] token", getToken() ? "✅" : "❌");
  const [user, setUser] = useState(null);
  const [result] = useQuery({ query: getUserQuery });
  useEffect(() => {
    if (result.data) {
      setUser(result.data.user[0]);
    }
  }, [result.data]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  console.log("[useAuth]");
  const { user, setUser } = useContext(AuthContext);
  async function logout() {
    setToken(null);
    try {
      await request("/api/logout", {
        credentials: "include",
        mode: "same-origin",
      });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("[ client logout ] failed", error);
    }
  }

  const isAuth = Boolean(user);
  return {
    user,
    isAuth,
    logout,
  };
}

export function withAuthProvider(WrappedComponent) {
  return class extends React.Component {
    static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;
    static async getInitialProps(ctx) {
      console.log(
        "[withAuthProvider] getInitialProps",
        ctx.req ? "server" : "client",
        getToken() ? "found token" : "no token"
      );

      const jwt_token = getToken();
      if (!jwt_token) {
        try {
          await refreshToken(ctx);
        } catch {
          console.error("[withAuthProvider] no token");
        }
      }

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));

      return { ...componentProps };
    }
    render() {
      return (
        <AuthProvider>
          <WrappedComponent {...this.props} />
        </AuthProvider>
      );
    }
  };
}
