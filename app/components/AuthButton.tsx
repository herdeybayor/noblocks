"use client";

import React from "react";
import { useAuth } from "@/app/context";
import { useRouter } from "next/navigation";

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className = "" }: AuthButtonProps) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const router = useRouter();

  // Handle login request
  const handleLogin = () => {
    router.push("/auth/signin");
  };

  // Handle logout request
  const handleLogout = async () => {
    await logout();
  };

  // Show loading state if auth is still being determined
  if (isLoading) {
    return (
      <button
        disabled
        className={`flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 ${className}`}
      >
        <svg
          className="mr-2 h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading...
      </button>
    );
  }

  if (isAuthenticated && user) {
    // User is logged in, show user info and logout button
    return (
      <div className="flex items-center">
        <div className="mr-4 text-sm font-medium">
          {user.name ||
            user.email ||
            user.address?.slice(0, 6) + "..." + user.address?.slice(-4)}
        </div>
        <button
          onClick={handleLogout}
          className={`rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 ${className}`}
        >
          Logout
        </button>
      </div>
    );
  }

  // User is not logged in, show login button
  return (
    <button
      onClick={handleLogin}
      className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 ${className}`}
    >
      Sign In
    </button>
  );
}
