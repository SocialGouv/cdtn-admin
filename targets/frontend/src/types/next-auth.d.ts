import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
      role: string;
      isDeleted: boolean;
      created_at: Date;
      accessToken: string;
      refreshToken: string;
      expiresIn: Date;
    };
  }
}
