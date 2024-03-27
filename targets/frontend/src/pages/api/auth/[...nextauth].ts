import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { generateNewAccessToken } from "src/modules/authentification/generateAccessToken";
import { verifyToken } from "src/modules/authentification/jwt";
import { UserSignedIn, signIn } from "src/modules/authentification/signIn";

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
      return {
        ...session,
        user: {
          id: token.id,
          accessToken: token.accessToken,
          email: token.email,
          name: token.name,
          role: token.role,
        } as Session["user"],
      };
    },
    jwt: async ({ token, user }) => {
      const tokenUser: UserSignedIn = { ...token, ...user } as any;
      const isAccessTokenValid = verifyToken(tokenUser.accessToken);
      if (!isAccessTokenValid) {
        const newAccessToken = await generateNewAccessToken(tokenUser);
        tokenUser.accessToken = newAccessToken;
      }
      return tokenUser;
    },
  },
};

export default NextAuth(authOptions);
