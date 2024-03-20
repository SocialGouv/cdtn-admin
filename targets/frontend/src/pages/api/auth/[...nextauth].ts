import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signIn } from "src/modules/authentification/signIn";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }
        const user = await signIn(credentials.email, credentials.password);
        return user;
      },
    }),
  ],
  secret:
    process.env.NEXTAUTH_SECRET ??
    "6ZYMHbt0mxOj9y6mTyG2nJVt2zWDEdckLJz248uflwI=",
};

export default NextAuth(authOptions);
