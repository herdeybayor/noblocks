"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define the AuthContext types
interface AuthContextType {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    address?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  provider?: string;
  ready: boolean; // Add ready property to match Privy API
  login: (provider: string, options?: any) => Promise<void>;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
  signMessage: (
    params: { message: string },
    options?: any,
  ) => Promise<{ signature: string } | null>;
  exportWallet: () => Promise<any>;
  linkEmail: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  ready: false,
  login: async () => {},
  loginWithWallet: async () => {},
  logout: async () => {},
  signMessage: async () => null,
  exportWallet: async () => null,
  linkEmail: async () => {},
  updateEmail: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update loading state based on session status
    setIsLoading(status === "loading");
  }, [status]);

  // Login with a specific provider
  const login = async (provider: string, options?: any) => {
    try {
      await signIn(provider, options);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Login with an Ethereum wallet
  const loginWithWallet = async () => {
    try {
      // Navigate to sign-in page, which handles wallet authentication
      router.push("/auth/signin");
    } catch (error) {
      console.error("Wallet login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Mock signMessage function to replace Privy's implementation
  const signMessage = async (
    { message }: { message: string },
    options?: any,
  ): Promise<{ signature: string } | null> => {
    console.log("Signing message:", message);
    console.log("Sign options:", options);
    // Return a mock signature
    return {
      signature: `0x${Array(130)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
    };
  };

  // Mock exportWallet function
  const exportWallet = async () => {
    console.log("Export wallet functionality would go here");
    return {
      privateKey: "0x" + "1".repeat(64),
    };
  };

  // Mock linkEmail function
  const linkEmail = async (email: string) => {
    console.log(`Would link email: ${email}`);
  };

  // Mock updateEmail function
  const updateEmail = async (email: string) => {
    console.log(`Would update email to: ${email}`);
  };

  // Provide the auth context value
  const value = {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading,
    ready: !isLoading, // map ready to the opposite of isLoading to match Privy's API
    provider: session?.provider,
    login,
    loginWithWallet,
    logout,
    signMessage,
    exportWallet,
    linkEmail,
    updateEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
