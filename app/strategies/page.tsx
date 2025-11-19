"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Zap, Shield, Plus } from 'lucide-react';
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";

export default function StrategiesPage() {
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">DeFi Strategies</h1>
          {isConnected ? (
            <Link href="/wallets">
              <Button variant="outline" size="sm">
                Wallets
              </Button>
            </Link>
          ) : (
            <ConnectWalletButton size="sm" />
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {!isConnected ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your wallet to access DeFi strategies and manage your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ConnectWalletButton size="lg" className="w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Strategies</h2>
                <p className="text-muted-foreground">
                  Manage and monitor your DeFi strategies across multiple chains
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Strategy
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <TrendingUp className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Yield Optimization</CardTitle>
                  <CardDescription>
                    Automatically move funds to highest-yield opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Auto-Compound</CardTitle>
                  <CardDescription>
                    Automatically reinvest rewards to maximize returns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Risk Management</CardTitle>
                  <CardDescription>
                    Set stop-loss and take-profit parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
