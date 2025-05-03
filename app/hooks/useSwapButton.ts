import { useAuth } from "../context/AuthContext";
import { UseFormWatch } from "react-hook-form";
import { useInjectedWallet } from "../context";

interface UseSwapButtonProps {
  watch: UseFormWatch<any>;
  balance?: number;
  isDirty: boolean;
  isValid: boolean;
  isUserVerified: boolean;
}

export function useSwapButton({
  watch,
  balance = 0,
  isDirty,
  isValid,
  isUserVerified,
}: UseSwapButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isInjectedWallet } = useInjectedWallet();
  const { amountSent, currency, recipientName } = watch();

  const isAmountValid = Number(amountSent) >= 0.5;
  const isCurrencySelected = Boolean(currency);

  const hasInsufficientBalance = amountSent > balance;

  const isEnabled = (() => {
    if (isInjectedWallet && hasInsufficientBalance) {
      return false;
    }

    if (hasInsufficientBalance && !isInjectedWallet && isAuthenticated) {
      return true;
    }

    if (
      !isUserVerified &&
      (isAuthenticated || isInjectedWallet) &&
      amountSent > 0 &&
      isCurrencySelected &&
      isAmountValid &&
      isDirty
    ) {
      return true;
    }

    if (isInjectedWallet) {
      if (!isDirty || !isValid || !isCurrencySelected || !isAmountValid) {
        return false;
      }
      return Boolean(recipientName);
    }

    if (!isDirty || !isValid || !isCurrencySelected || !isAmountValid) {
      return false;
    }

    if (!isAuthenticated && !isInjectedWallet) {
      return true; // Enable for login if amount and currency are valid
    }

    return Boolean(recipientName); // Additional check for isAuthenticated users
  })();

  const buttonText = (() => {
    if (isInjectedWallet && hasInsufficientBalance) {
      return "Insufficient balance";
    }

    if (isAuthenticated && hasInsufficientBalance && !isInjectedWallet) {
      return "Fund wallet";
    }

    if (
      !isUserVerified &&
      (isAuthenticated || isInjectedWallet) &&
      amountSent > 0
    ) {
      return "Get started";
    }

    return "Swap";
  })();

  const buttonAction = (
    handleSwap: () => void,
    login: () => void,
    handleFundWallet: () => void,
    setIsKycModalOpen: () => void,
    isUserVerified: boolean,
  ) => {
    if (!isAuthenticated && !isInjectedWallet) {
      return login;
    }
    if (hasInsufficientBalance && !isInjectedWallet && isAuthenticated) {
      return handleFundWallet;
    }
    if (!isUserVerified && (isAuthenticated || isInjectedWallet)) {
      return setIsKycModalOpen;
    }
    return handleSwap;
  };

  return {
    isEnabled,
    buttonText,
    buttonAction,
    hasInsufficientBalance,
  };
}
