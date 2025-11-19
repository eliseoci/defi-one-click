"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { ChainBalances } from "@/components/dashboard/chain-balances";
import { StakingPositions } from "@/components/dashboard/staking-positions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your dashboard and manage your DeFi portfolio.
            </p>
            <ConnectWalletButton size="lg" className="w-full justify-center" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Portfolio Overview Section */}
        <PortfolioOverview walletAddress={address} />

        {/* Quick Actions - One-Step Execution */}
        <QuickActions />

        {/* Grid Layout for Chain Balances and Staking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChainBalances walletAddress={address} />
          <StakingPositions walletAddress={address} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions walletAddress={address} />
      </main>
    </div>
  );
}
