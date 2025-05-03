import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchWalletBalance, getRpcUrl } from "../utils";
import { useAuth } from "./AuthContext";
import { useNetwork } from "./NetworksContext";
import { useSmartWallets } from "./SmartWalletContext";
import { createPublicClient, http } from "viem";
import { useInjectedWallet } from "./InjectedWalletContext";
import { bsc } from "viem/chains";
import { useWallets } from "../hooks/useWalletHooks";

interface WalletBalances {
  total: number;
  balances: Record<string, number>;
}

interface BalanceContextProps {
  smartWalletBalance: WalletBalances | null;
  externalWalletBalance: WalletBalances | null;
  injectedWalletBalance: WalletBalances | null;
  allBalances: {
    smartWallet: WalletBalances | null;
    externalWallet: WalletBalances | null;
    injectedWallet: WalletBalances | null;
  };
  refreshBalance: () => void;
  isLoading: boolean;
}

const BalanceContext = createContext<BalanceContextProps | undefined>(
  undefined,
);

export const BalanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading: authLoading, user } = useAuth();
  const { wallets } = useWallets();
  const { activeSmartWallet } = useSmartWallets();
  const { selectedNetwork } = useNetwork();
  const { isInjectedWallet, injectedAddress, injectedReady, injectedProvider } =
    useInjectedWallet();

  const [smartWalletBalance, setSmartWalletBalance] =
    useState<WalletBalances | null>(null);
  const [externalWalletBalance, setExternalWalletBalance] =
    useState<WalletBalances | null>(null);
  const [injectedWalletBalance, setInjectedWalletBalance] =
    useState<WalletBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = async () => {
    setIsLoading(true);

    try {
      if (!authLoading && !isInjectedWallet) {
        const smartWalletAddress = activeSmartWallet?.address;
        const externalWalletAddress = wallets.find(
          (account) => account.walletClientType === "injected",
        )?.address;

        const publicClient = createPublicClient({
          chain: selectedNetwork.chain,
          transport: http(
            selectedNetwork.chain.id === bsc.id
              ? "https://bsc-dataseed.bnbchain.org/"
              : undefined,
          ),
        });

        if (smartWalletAddress) {
          const result = await fetchWalletBalance(
            publicClient,
            smartWalletAddress,
          );
          setSmartWalletBalance(result);
        } else {
          setSmartWalletBalance(null);
        }

        if (externalWalletAddress) {
          const result = await fetchWalletBalance(
            publicClient,
            externalWalletAddress,
          );
          setExternalWalletBalance(result);
        } else {
          setExternalWalletBalance(null);
        }

        setInjectedWalletBalance(null);
      } else if (
        isInjectedWallet &&
        injectedReady &&
        injectedAddress &&
        injectedProvider
      ) {
        try {
          const publicClient = createPublicClient({
            chain: selectedNetwork.chain,
            transport: http(getRpcUrl(selectedNetwork.chain.name)),
          });

          const result = await fetchWalletBalance(
            publicClient,
            injectedAddress,
          );
          setInjectedWalletBalance(result);

          setSmartWalletBalance(null);
          setExternalWalletBalance(null);
        } catch (error) {
          console.error("Error fetching injected wallet balance:", error);
          setInjectedWalletBalance(null);
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setSmartWalletBalance(null);
      setExternalWalletBalance(null);
      setInjectedWalletBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authLoading,
    user,
    selectedNetwork,
    isInjectedWallet,
    injectedReady,
    injectedAddress,
  ]);

  const allBalances = {
    smartWallet: smartWalletBalance,
    externalWallet: externalWalletBalance,
    injectedWallet: injectedWalletBalance,
  };

  return (
    <BalanceContext.Provider
      value={{
        smartWalletBalance,
        externalWalletBalance,
        injectedWalletBalance,
        allBalances,
        refreshBalance: fetchBalances,
        isLoading,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
