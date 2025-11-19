import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">OneAPI</span>
        </div>
        <ConnectWalletButton />
      </div>
    </header>
  );
}

