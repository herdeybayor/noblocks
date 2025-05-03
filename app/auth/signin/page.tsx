"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SiweMessage } from "siwe";
import { formatEthAddress } from "@/app/utils";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle credential-based login
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An error occurred during sign in");
    }
  };

  // Handle wallet-based login
  const handleWalletSignIn = async () => {
    try {
      setIsConnecting(true);

      // Check if Ethereum is available in the browser
      if (typeof window.ethereum === "undefined") {
        setError("No Ethereum wallet found. Please install MetaMask.");
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const rawAddress = accounts[0];
      const address = formatEthAddress(rawAddress);

      // Get chain ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Create and sign the SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the application.",
        uri: window.location.origin,
        version: "1",
        chainId: parseInt(chainId, 16),
        nonce: await createNonce(),
      });

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message.prepareMessage(), address, ""],
      });

      // Sign in with the signed message
      const result = await signIn("ethereum", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Helper function to create a nonce
  const createNonce = async () => {
    // In a real app, you'd want to get this from your server
    return Math.random().toString(36).substring(2, 10);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Email/Password Sign In Form */}
        <form onSubmit={handleEmailSignIn} className="mb-6">
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Sign In with Email
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Sign In Options */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="focus:shadow-outline mb-4 flex w-full items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 font-bold text-gray-700 focus:outline-none"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign In with Google
        </button>

        {/* Wallet Sign In Option */}
        <button
          onClick={handleWalletSignIn}
          disabled={isConnecting}
          className="focus:shadow-outline flex w-full items-center justify-center rounded bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-800 focus:outline-none"
        >
          {isConnecting ? (
            "Connecting Wallet..."
          ) : (
            <>
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12V7H5V17H12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 14H19V18H16V14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 14V12C19 10.8954 18.1046 10 17 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign In with Wallet
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Add TypeScript global augmentation for Ethereum window object
declare global {
  interface Window {
    ethereum: any;
  }
}
