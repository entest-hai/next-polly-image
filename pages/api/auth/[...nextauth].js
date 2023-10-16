import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    // signIn: "/auth",
    // signOut: "/signout"
  },
  events: {
    async signOut(message) {
      console.log(message);
    },
  },
  session: {
    // seconds - how long until a idle session expires
    maxAge: 5 * 60,
    // seconds - how frequently to write to database to extend a session
    updateAge: 60 * 60,
    //
    clientMaxAge: 5 * 60,
    //
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session({ session, user, token }) {

      try {
        session.id_token = token.id_token;

      } catch (error) {}

      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      try {
        token.id_token = account.id_token;
        // console.log("callback jwt ", token);
      } catch (error) {}
      return token;
    },
  },
};

export default NextAuth(authOptions);