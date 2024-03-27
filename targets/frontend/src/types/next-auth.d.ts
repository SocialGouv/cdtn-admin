import NextAuth from "next-auth";
import { UserSignedIn } from "src/modules/authentification/signIn";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      name: string;
      email: string;
      accessToken: string;
      id: string;
      role: "super" | "user";
    };
  }
}
