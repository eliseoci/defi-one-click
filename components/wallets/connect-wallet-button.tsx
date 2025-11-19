"use client";

import { type MouseEventHandler, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, WalletIcon } from 'lucide-react';
import { useAccount } from "wagmi";
import { useRouter } from 'next/navigation';

interface ConnectWalletButtonProps extends ButtonProps {
  label?: string;
  connectedLabel?: string;
  showIcon?: boolean;
  redirectTo?: string;
}

export function ConnectWalletButton({
  label = "Connect Wallet",
  connectedLabel,
  showIcon = true,
  className,
  children,
  onClick,
  redirectTo,
  ...buttonProps
}: ConnectWalletButtonProps) {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && redirectTo) {
      console.log("[v0] Wallet connected, redirecting to:", redirectTo);
      router.push(redirectTo);
    }
  }, [isConnected, redirectTo, router]);

  const formatAddress = (address?: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address }) => {
        const buttonContent =
          children ??
          (() => {
            if (isConnecting) {
              return (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              );
            }

            if (isConnected) {
              return connectedLabel ?? formatAddress(address);
            }

            return (
              <>
                {showIcon && <WalletIcon className="mr-2 h-4 w-4" />}
                {label}
              </>
            );
          })();

        const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            show();
          }
        };

        return (
          <Button
            type="button"
            {...buttonProps}
            onClick={handleClick}
            className={cn("inline-flex items-center", className)}
          >
            {buttonContent}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
