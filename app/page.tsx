"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Zap, Shield, Target } from 'lucide-react';

export default function HomePage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/strategies");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DeFi Hub</span>
          </div>
          <ConnectWalletButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Discover & Deploy{" "}
            <span className="text-primary">DeFi Strategies</span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            Access curated DeFi strategies across multiple chains. Deposit with any token and let smart routing handle the rest.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/strategies">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Strategies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Optimized DeFi Strategies
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Target className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Curated Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hand-picked yield strategies across top DeFi protocols and chains
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Quick Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deposit with any token - automatic swaps happen seamlessly under the hood
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Real APY Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor live APY rates and historical performance for informed decisions
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 text-center md:p-12">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Earning?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Connect your wallet and explore high-yield DeFi strategies
          </p>
          <ConnectWalletButton size="lg" className="w-full sm:w-auto justify-center" />
        </div>
      </section>
    </div>
  );
}
