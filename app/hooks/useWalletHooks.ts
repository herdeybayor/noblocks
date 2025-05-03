"use client";
import { useAuth } from "../context/AuthContext";
import { useInjectedWallet } from "../context/InjectedWalletContext";

// Replacement for privy's useFundWallet
export function useFundWallet(options?: any) {
  return {
    fundWallet: async (walletAddress: string, params: any) => {
      console.log(
        "Fund wallet functionality would go here",
        walletAddress,
        params,
      );

      // If there's an onUserExited callback in options, call it after a short delay to simulate funding
      setTimeout(() => {
        if (options?.onUserExited) {
          options.onUserExited({ fundingMethod: "mock", chain: params.chain });
        }
      }, 1000);

      return Promise.resolve();
    },
  };
}

// Replacement for privy's useLinkAccount
export function useLinkAccount() {
  return {
    linkEmail: async (email: string) => {
      console.log(`Would link email: ${email}`);
      return Promise.resolve();
    },
    isLinking: false,
  };
}

// Replacement for privy's useLogout
export function useLogout() {
  const { logout } = useAuth();
  return logout;
}

// Replacement for privy's useMfaEnrollment
export function useMfaEnrollment() {
  return {
    mfaEnrollmentState: "notEnrolled",
    enrollInMfa: async () => {},
    verifyMfaEnrollment: async () => {},
    initiateRecovery: async () => {},
    completeRecovery: async () => {},
    isLoading: false,
  };
}

// Replacement for privy's useWallets
export function useWallets() {
  const { user } = useAuth();
  const { injectedAddress, injectedProvider } = useInjectedWallet();

  const wallets = [];

  if (user?.address) {
    wallets.push({
      address: user.address,
      chainId: 1,
      walletClientType: "custom",
    });
  }

  if (injectedAddress) {
    wallets.push({
      address: injectedAddress,
      chainId: 1,
      walletClientType: "injected",
    });
  }

  return {
    wallets,
    ready: true,
  };
}
