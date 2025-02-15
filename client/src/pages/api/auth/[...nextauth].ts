import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Type assertion to ensure token is of the correct type
      const typedToken = token as { accessToken?: string };
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = typedToken.accessToken;
      return session;
    },
  },
};

export default NextAuth(options);
