"use client";
import config from "@/app/lib/config";
import { AnimatePresence, motion } from "framer-motion";
import {
  AccessIcon,
  Copy01Icon,
  CustomerService01Icon,
  Key01Icon,
  Logout03Icon,
  Mail01Icon,
  Setting07Icon,
  Wallet01Icon,
} from "hugeicons-react";
import { useRef, useState } from "react";
import { ImSpinner } from "react-icons/im";
import { PiCheck } from "react-icons/pi";
import { toast } from "sonner";
import { useInjectedWallet } from "../context";
import { useAuth } from "../context/AuthContext";
import { useOutsideClick } from "../hooks";
import { useWalletDisconnect } from "../hooks/useWalletDisconnect";
import {
  useLinkAccount,
  useLogout,
  useMfaEnrollment,
} from "../hooks/useWalletHooks";

// Utility functions
const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");
const shortenAddress = (address: string, chars = 4): string => {
  return address.length > chars * 2 + 5
    ? `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`
    : address;
};

const dropdownVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  closed: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export const SettingsDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  // const { showMfaEnrollmentModal } = useMfaEnrollment();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isInjectedWallet, injectedAddress } = useInjectedWallet();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsOpen(false),
  });

  const walletAddress = isInjectedWallet ? injectedAddress : user?.address;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress ?? "");
    setIsAddressCopied(true);
    setTimeout(() => setIsAddressCopied(false), 2000);
  };

  const logout = useLogout();

  const linkEmail = useLinkAccount();

  const { disconnectWallet } = useWalletDisconnect();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      if (window.ethereum) {
        await disconnectWallet();
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Still proceed with logout even if wallet disconnection fails
      await logout();
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-label="Wallet details"
        aria-haspopup="true"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-accent-gray p-2 transition-colors duration-300 hover:bg-border-light focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 dark:bg-white/10 dark:hover:bg-white/20 dark:focus-visible:ring-offset-neutral-900"
      >
        <Setting07Icon
          className={classNames(
            "size-5 text-outline-gray transition-transform duration-300 dark:text-white/50",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            variants={dropdownVariants}
            aria-label="Dropdown menu"
            className="absolute right-0 z-10 mt-4 w-fit min-w-40 space-y-4 overflow-hidden rounded-xl border border-border-light bg-white p-2 shadow-xl dark:border-white/10 dark:bg-neutral-800"
          >
            <ul
              role="menu"
              aria-labelledby="settings-dropdown"
              aria-orientation="vertical"
              className="text-sm font-normal text-black *:px-4 *:py-2 dark:text-white/80"
            >
              <li
                role="menuitem"
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
              >
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-4"
                  onClick={handleCopyAddress}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet01Icon className="size-5 text-icon-outline-secondary dark:text-white/50" />
                    <p className="max-w-60 break-words">
                      {shortenAddress(walletAddress ?? "", 10)}
                    </p>
                  </div>
                  {isAddressCopied ? (
                    <PiCheck className="size-4 text-green-900 dark:text-green-500" />
                  ) : (
                    <Copy01Icon
                      className="size-4 text-icon-outline-secondary transition-all group-hover:text-lavender-500 dark:text-white/50 dark:hover:text-white"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </li>

              {!isInjectedWallet && (
                <li
                  role="menuitem"
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
                >
                  <button
                    type="button"
                    className="group flex w-full items-center justify-between gap-4"
                    onClick={() =>
                      toast.info("MFA functionality is currently unavailable")
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Key01Icon className="size-5 text-icon-outline-secondary dark:text-white/50" />
                      <p>Enable MFA</p>
                    </div>
                  </button>
                </li>
              )}

              {!isInjectedWallet &&
                (user?.email ? (
                  <li
                    role="menuitem"
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
                  >
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between gap-4"
                      onClick={() =>
                        toast.info(
                          "Email update functionality is currently unavailable",
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail01Icon className="size-5 flex-shrink-0 text-icon-outline-secondary dark:text-white/50" />
                        <p className="whitespace-nowrap">Linked email</p>
                      </div>
                      <p className="max-w-32 truncate text-neutral-500 dark:text-white/40">
                        {user.email}
                      </p>
                    </button>
                  </li>
                ) : (
                  <li
                    role="menuitem"
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
                  >
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between gap-2.5"
                      onClick={() =>
                        toast.info(
                          "Link email functionality is currently unavailable",
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail01Icon className="size-5 text-icon-outline-secondary dark:text-white/50" />
                        <p>Link email address</p>
                      </div>
                    </button>
                  </li>
                ))}
              {!isInjectedWallet && (
                <li
                  role="menuitem"
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
                  onClick={() =>
                    toast.info(
                      "Export wallet functionality is currently unavailable",
                    )
                  }
                >
                  <AccessIcon className="size-5 text-icon-outline-secondary dark:text-white/50" />
                  <p>Export wallet</p>
                </li>
              )}
              <li
                role="menuitem"
                className="flex cursor-pointer items-center gap-2.5 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
              >
                <a
                  href={config.contactSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5"
                >
                  <CustomerService01Icon className="size-5 text-icon-outline-secondary dark:text-white/50" />
                  <p>Contact support</p>
                </a>
              </li>
              {!isInjectedWallet && (
                <li
                  role="menuitem"
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg transition-all duration-300 hover:bg-accent-gray dark:hover:bg-neutral-700"
                  onClick={handleLogout}
                >
                  {isLoggingOut ? (
                    <ImSpinner className="size-5 animate-spin text-icon-outline-secondary dark:text-white/50" />
                  ) : (
                    <Logout03Icon className="size-5 text-icon-outline-secondary dark:text-white/50" />
                  )}
                  <p>Sign out</p>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
