import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { formatEthAddress } from "@/app/utils";

// Configure Auth Providers
export const authOptions = {
  providers: [
    // Traditional Credentials Provider
    CredentialsProvider({
      id: "credentials",
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Here you would typically verify credentials against your database
          // For demonstration, we'll use a simple check
          // In production, replace with actual API call to your auth backend
          const user = {
            id: "1",
            name: "Demo User",
            email: credentials.email,
          };

          return user;
        } catch (error) {
          return null;
        }
      },
    }),

    // Ethereum Wallet Authentication
    CredentialsProvider({
      id: "ethereum",
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.message || !credentials?.signature) return null;

        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message));

          // Verify the signature
          const result = await siwe.verify({
            signature: credentials.signature,
          });

          if (!result.success) return null;

          // Format the address to comply with EIP-55
          const formattedAddress = formatEthAddress(siwe.address);

          // Return the user object with properly formatted address
          return {
            id: formattedAddress,
            name:
              formattedAddress.slice(0, 6) + "..." + formattedAddress.slice(-4),
            address: formattedAddress,
          };
        } catch (error) {
          console.error("SIWE verification error:", error);
          return null;
        }
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // Configure Session
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom JWT callback
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user: any;
      account: any;
    }) {
      // Add wallet address to token if available
      if (user?.address) {
        token.address = user.address;
      }

      // Add account info during initial sign-in
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      // Add wallet address to session if available
      if (token.address) {
        session.user.address = token.address;
      }

      // Add provider info
      session.provider = token.provider;

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions as AuthOptions);

export { handler as GET, handler as POST };
