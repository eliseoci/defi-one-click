'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from "@/lib/wallet-store";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { ChainBalances } from "@/components/dashboard/chain-balances";
import { StakingPositions } from "@/components/dashboard/staking-positions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, connectedAddress } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!isConnected || !connectedAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your dashboard and manage your DeFi portfolio.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => router.push('/wallets')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
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
        <PortfolioOverview walletAddress={connectedAddress} />

        {/* Quick Actions - One-Step Execution */}
        <QuickActions />

        {/* Grid Layout for Chain Balances and Staking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChainBalances walletAddress={connectedAddress} />
          <StakingPositions walletAddress={connectedAddress} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions walletAddress={connectedAddress} />
      </main>
    </div>
  );
}
