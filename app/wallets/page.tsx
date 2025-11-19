"use client";

import { useState, useEffect } from "react";
import { WalletManager } from "@/components/wallets/wallet-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function WalletsPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={isConnected && address ? "/dashboard" : "/"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Wallet Manager</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <WalletManager />
      </main>
    </div>
  );
}
