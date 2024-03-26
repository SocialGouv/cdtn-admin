import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { generateNewAccessToken } from "src/modules/authentification/generateAccessToken";
import { verifyToken } from "src/modules/authentification/jwt";
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
      return {
        ...session,
        user: { ...session.user, accessToken: token.accessToken, id: token.id },
      };
    },
    jwt: async ({ token, user }) => {
      const usr: Session["user"] = { ...token, ...user } as any;
      const isValid = verifyToken(usr.accessToken);
      if (!isValid) {
        const newAccessToken = await generateNewAccessToken(
          usr.refreshToken,
          usr.accessToken
        );
        usr.accessToken = newAccessToken;
      }
      return usr;
    },
  },
};

export default NextAuth(authOptions);
