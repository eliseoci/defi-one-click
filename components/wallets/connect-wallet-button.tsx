"use client";

import { type MouseEventHandler } from "react";
import { ConnectKitButton } from "connectkit";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Wallet as WalletIcon } from "lucide-react";

interface ConnectWalletButtonProps extends ButtonProps {
  label?: string;
  connectedLabel?: string;
  showIcon?: boolean;
}

export function ConnectWalletButton({
  label = "Connect Wallet",
  connectedLabel,
  showIcon = true,
  className,
  children,
  onClick,
  ...buttonProps
}: ConnectWalletButtonProps) {
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
