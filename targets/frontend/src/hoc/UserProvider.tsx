import { decode, JwtPayload } from "jsonwebtoken";
import React, { createContext } from "react";
import { getDisplayName } from "src/hoc/getDisplayName";
import { Role } from "src/lib/auth/auth.const";
import { auth } from "src/lib/auth/token";
import { request } from "src/lib/request";
import { NextPageContext } from "next";
import { useRouter } from "next/router";

export const UserContext = createContext({});

export function withUserProvider(WrappedComponent: any) {
  return class extends React.Component<{
    tokenData: string;
  }> {
    static displayName = `withUserProvider(${getDisplayName(
      WrappedComponent
    )})`;

    static async getInitialProps(ctx: NextPageContext) {
      const token = await auth(ctx);
      console.log("[ withUserProvider ] ctx", !!ctx);
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

export const ProvideUser = ({
  children,
  tokenData,
}: {
  children: React.ReactElement;
  tokenData: null | JwtPayload | string;
}) => {
  const router = useRouter();
  let user = null;
  if (tokenData) {
    const claims = (tokenData as any)["https://hasura.io/jwt/claims"];
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
    router.push("/login");
  }

  const isAuth = Boolean(user);
  const isAdmin = user?.roles.includes(Role.SUPER);

  return (
    <UserContext.Provider value={{ isAdmin, isAuth, logout, user }}>
      {children}
    </UserContext.Provider>
  );
};
