"use client";
import { Toaster } from "sonner";
import { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import config from "./lib/config";
import {
  AuthProvider,
  BalanceProvider,
  InjectedWalletProvider,
  NetworkProvider,
  StepProvider,
  SmartWalletsProvider,
} from "./context";
import { useActualTheme } from "./hooks/useActualTheme";

function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AppProviders>{children}</AppProviders>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppProviders({ children }: { children: ReactNode }) {
  const isDark = useActualTheme();

  return (
    <AuthProvider>
      <ContextProviders>{children}</ContextProviders>
      <Toaster
        position={
          typeof window !== "undefined" && window.innerWidth < 640
            ? "top-center"
            : "bottom-right"
        }
        theme={isDark ? "dark" : "light"}
      />
    </AuthProvider>
  );
}

function ContextProviders({ children }: { children: ReactNode }) {
  return (
    <NetworkProvider>
      <InjectedWalletProvider>
        <SmartWalletsProvider>
          <StepProvider>
            <BalanceProvider>{children}</BalanceProvider>
          </StepProvider>
        </SmartWalletsProvider>
      </InjectedWalletProvider>
    </NetworkProvider>
  );
}

export default Providers;
