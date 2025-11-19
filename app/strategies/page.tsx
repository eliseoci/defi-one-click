"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Search, Filter } from 'lucide-react';
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { StrategiesHeader } from "@/components/strategies/strategies-header";
import { StrategiesFilters } from "@/components/strategies/strategies-filters";
import { StrategiesTable } from "@/components/strategies/strategies-table";
import { mockStrategies } from "@/lib/mock-data";

export default function StrategiesPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/");
    }
  }, [mounted, isConnected, router]);

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
              Please connect your wallet to view available DeFi strategies and vaults.
            </p>
            <ConnectWalletButton size="lg" className="w-full justify-center" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredStrategies = mockStrategies.filter((strategy) => {
    const matchesCategory = selectedCategory === "all" || strategy.category === selectedCategory || 
      (selectedCategory === "boosts" && strategy.isBoosted) ||
      (selectedCategory === "saved" && false) || // TODO: Implement saved strategies
      (selectedCategory === "positions" && strategy.deposited > 0);
    
    const matchesSearch = searchQuery === "" || 
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.protocol.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <StrategiesHeader walletAddress={address} />

        <StrategiesFilters 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <StrategiesTable strategies={filteredStrategies} />
      </main>
    </div>
  );
}
