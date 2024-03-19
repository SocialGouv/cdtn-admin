import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      name: string;
      isAdmin: boolean;
      email: string;
      roles: Array<any>;
      created_at: Date;
    };
  }
}
