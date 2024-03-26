import NextAuth, { NextAuthOptions, Session } from "next-auth";
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
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: ({ session, token }) => {
      return { ...session, accessToken: token.accessToken, id: token.id };
    },
    jwt: async ({ token, user }) => {
      return {
        ...token,
        ...user,
      };
    },
  },
};

export default NextAuth(authOptions);
