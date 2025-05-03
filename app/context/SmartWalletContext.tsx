"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { useInjectedWallet } from "./InjectedWalletContext";

interface SmartWallet {
  address: string;
  chainId: number;
  status: "deployed" | "deploying" | "failed" | "notDeployed";
}

interface SmartWalletsContextType {
  smartWallets: SmartWallet[];
  isLoading: boolean;
  activeSmartWallet: SmartWallet | null;
  deployActiveSmartWallet: () => Promise<void>;
  client: {
    switchChain: (params: { id: number }) => Promise<void>;
    sendTransaction: (params: {
      calls: { to: string; data: string }[];
    }) => Promise<void>;
  };
}

const SmartWalletsContext = createContext<SmartWalletsContextType>({
  smartWallets: [],
  isLoading: true,
  activeSmartWallet: null,
  deployActiveSmartWallet: async () => {},
  client: {
    switchChain: async () => {},
    sendTransaction: async () => {},
  },
});

export function SmartWalletsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { injectedAddress } = useInjectedWallet();
  const [smartWallets, setSmartWallets] = useState<SmartWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSmartWallet, setActiveSmartWallet] =
    useState<SmartWallet | null>(null);

  useEffect(() => {
    // This would normally load the user's smart wallets from your backend
    // For now we're creating a mock implementation
    if (isAuthenticated && user?.address) {
      setIsLoading(true);
      // Mock data - you'll want to replace this with actual smart wallet data
      const mockSmartWallet = {
        address: user.address,
        chainId: 1, // Default to Ethereum mainnet
        status: "deployed" as const,
      };

      setSmartWallets([mockSmartWallet]);
      setActiveSmartWallet(mockSmartWallet);
      setIsLoading(false);
    } else if (injectedAddress) {
      // Use injected wallet as active wallet
      const injectedWallet = {
        address: injectedAddress,
        chainId: 1, // You might want to get the actual chain ID from the provider
        status: "deployed" as const,
      };

      setSmartWallets([injectedWallet]);
      setActiveSmartWallet(injectedWallet);
      setIsLoading(false);
    } else {
      setSmartWallets([]);
      setActiveSmartWallet(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, injectedAddress]);

  const deployActiveSmartWallet = async () => {
    // This would normally deploy a smart wallet
    // For now we just return a mock implementation
    console.log("Deploying smart wallet...");
    return Promise.resolve();
  };

  // Mock client implementation
  const client = {
    switchChain: async ({ id }: { id: number }) => {
      console.log(`Switching to chain ID: ${id}`);
      return Promise.resolve();
    },
    sendTransaction: async ({
      calls,
    }: {
      calls: { to: string; data: string }[];
    }) => {
      console.log(`Sending ${calls.length} transaction calls`);
      return Promise.resolve();
    },
  };

  return (
    <SmartWalletsContext.Provider
      value={{
        smartWallets,
        isLoading,
        activeSmartWallet,
        deployActiveSmartWallet,
        client,
      }}
    >
      {children}
    </SmartWalletsContext.Provider>
  );
}

export const useSmartWallets = () => useContext(SmartWalletsContext);
