import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return AuthService.signIn(credentials?.email, credentials?.password);

        // if (user) {
        //   // Any object returned will be saved in `user` property of the JWT
        //   return user;
        // } else {
        //   // If you return null then an error will be displayed advising the user to check their details.
        //   return null;

        //   // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        // }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // let newToken = user || token;
      // if (newToken && newToken.access_token) {
      //   newToken = await AuthService.refreshToken(newToken);
      //   const userProfile = await UserService.getProfile(
      //     newToken.access_token
      //   ).catch(() => null);
      //   if (userProfile) {
      //     newToken = {
      //       ...newToken,
      //       username: userProfile.username,
      //       profile_picture: userProfile.profile_picture,
      //       first_name: userProfile.first_name,
      //       last_name: userProfile.last_name,
      //     };
      //   }
      // }
      // return newToken;
    },
  },
};

export default NextAuth(authOptions);
