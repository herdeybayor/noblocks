"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    default: "An error occurred during authentication",
    CredentialsSignin: "Invalid email or password",
    OAuthSignin: "Error during sign in with provider",
    OAuthCallback: "Error during callback from provider",
    OAuthAccountNotLinked:
      "This account is already linked to another sign-in method",
    Verification: "The verification link is invalid or has expired",
    AccessDenied: "You do not have permission to sign in",
    SessionRequired: "Please sign in to access this page",
  };

  const errorMessage = error
    ? errorMessages[error] || errorMessages.default
    : errorMessages.default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Authentication Error
        </h1>

        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {errorMessage}
        </div>

        <div className="flex justify-center">
          <Link href="/auth/signin">
            <button className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
