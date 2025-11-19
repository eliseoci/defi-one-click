import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wallet, TrendingUp, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DeFi Hub</span>
          </div>
          <ConnectWalletButton redirectTo="/strategies" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Manage Your Multichain DeFi Portfolio in{" "}
            <span className="text-primary">One Step</span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            Bridge, swap, and stake across Ethereum, Arbitrum, Optimism, Polygon, Base, and Solana
            with a single transaction. No more multiple steps, no more hassle.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/strategies">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
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
            Everything You Need to Manage DeFi
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Wallet className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Multichain Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track all your assets across 6 chains in one unified view
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>One-Step Execution</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Bridge, swap, and stake in a single transaction with optimized routing
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Real-Time Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor portfolio performance with live data and detailed metrics
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Transaction Simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Preview outcomes and fees before executing any transaction
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 text-center md:p-12">
          <h2 className="mb-4 text-3xl font-bold">Ready to Simplify Your DeFi?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Connect your wallet and start managing your multichain portfolio in seconds
          </p>
          <ConnectWalletButton redirectTo="/strategies" size="lg" className="w-full sm:w-auto justify-center" />
        </div>
      </section>
    </div>
  );
}
