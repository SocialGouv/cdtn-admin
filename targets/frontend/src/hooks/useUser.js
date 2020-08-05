import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserId } from "src/lib/auth/token";
import { request } from "src/lib/request";
import { useQuery } from "urql";

export const UserContext = createContext({
  setUser: () => {},
  user: null,
});

export const getUserQuery = `
query getUser($id: uuid!) {
  user:auth_users_by_pk(id: $id) {
    __typename
    id
    email
    name
    active
    default_role
    roles: user_roles {
      role
    }
  }
}
`;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const id = getUserId();
  const [result] = useQuery({
    query: getUserQuery,
    variables: { id },
  });

  useEffect(() => {
    if (result.data?.user) {
      setUser(result.data?.user);
    }
  }, [result.data]);

  return (
    <UserContext.Provider value={{ setUser, user }}>
      {children}
    </UserContext.Provider>
  );
}
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUser() {
  const { user } = useContext(UserContext);
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
  const isAdmin = user?.roles.some((item) => item.role === "admin");
  return {
    isAdmin,
    isAuth,
    logout,
    user,
  };
}
