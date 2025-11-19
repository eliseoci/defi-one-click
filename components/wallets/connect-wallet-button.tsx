"use client";

import { ConnectKitButton } from "connectkit";
import { cn } from "@/lib/utils";

type NativeConnectProps = Parameters<typeof ConnectKitButton>[0];

interface ConnectWalletButtonProps extends Pick<NativeConnectProps, "label" | "showBalance" | "showAvatar" | "theme" | "mode" | "customTheme"> {
  className?: string;
  onOpen?: () => void;
}

export function ConnectWalletButton({
  label = "Connect Wallet",
  showBalance = false,
  showAvatar = true,
  theme,
  mode,
  customTheme,
  className,
  onOpen,
}: ConnectWalletButtonProps) {
  return (
    <div className={cn("flex w-fit", className)}>
      <ConnectKitButton
        label={label}
        showBalance={showBalance}
        showAvatar={showAvatar}
        theme={theme}
        mode={mode}
        customTheme={customTheme}
        onClick={(open) => {
          onOpen?.();
          open();
        }}
      />
    </div>
  );
}
