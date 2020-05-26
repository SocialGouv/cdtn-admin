import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken } from "src/lib/auth";
import { request } from "src/lib/request";
import { useQuery } from "urql";

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
    setUser(null);
    try {
      await request("/api/logout", {
        credentials: "include",
        mode: "same-origin",
      });
    } catch (error) {
      console.error("[ client logout ] failed", error);
    }
    window.location.reload(true);
  }

  const isAuth = Boolean(user);
  return {
    user,
    isAuth,
    logout,
  };
}
