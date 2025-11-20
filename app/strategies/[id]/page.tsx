"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { useAccount, useBalance } from "wagmi";
import type { Address } from "viem";
import { mainnet } from "wagmi/chains";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TransactionWorkflowWidget } from "@/components/execute/transaction-workflow-widget";
import { mockStrategies, mockTokens, mockChains } from "@/lib/mock-data";
import { ArrowLeft, Share2, Bookmark, ChevronDown, Info, TrendingUp } from 'lucide-react';
import Link from "next/link";
import { useTransactionWorkflow } from "@/hooks/use-transaction-workflow";

const HistoricalRateCard = dynamic(() => import("@/components/strategies/historical-rate-card"), {
  ssr: false,
});

const SUSDS_CONTRACT_ADDRESS = "0xa3931d71877c0e7a3148cb7eb4463524fec27fbd" as Address;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const strategy = mockStrategies.find((s) => s.id === params.id);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const { transactionWorkflowSteps, walletExecutionProvider, isWalletReady } = useTransactionWorkflow();
  const { data: susdsBalance, isPending: isSusdsBalancePending, refetch: refetchSusdsBalance } = useBalance({
    address: address ?? ZERO_ADDRESS,
    token: SUSDS_CONTRACT_ADDRESS,
    chainId: mainnet.id,
    query: {
      enabled: Boolean(address),
      staleTime: 30_000,
    },
  });

  const formattedSusdsBalance = useMemo(() => {
    if (!address) {
      return "0.00";
    }
    if (isSusdsBalancePending) {
      return "Fetching...";
    }
    const value = susdsBalance?.formatted ?? "0";
    return Number.parseFloat(value).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
  }, [address, susdsBalance?.formatted, isSusdsBalancePending]);

  const handleWorkflowComplete = () => {
    void refetchSusdsBalance();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (strategy?.chain && !selectedChain) {
      const defaultChain = mockChains.find((chain) => chain.name === strategy.chain)?.id ?? "";
      setSelectedChain(defaultChain);
    }
  }, [strategy?.chain, selectedChain]);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/");
    }
  }, [mounted, isConnected, router]);

  if (!mounted) {
    return null;
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Strategy Not Found</h2>
          <Link href="/strategies">
            <Button>Back to Strategies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedTokenData = mockTokens.find(t => t.symbol === selectedToken);
  const selectedChainData = mockChains.find((chain) => chain.id === selectedChain || chain.name === selectedChain);
  const maxAmount = selectedTokenData?.balance || 0;

  const handlePercentage = (pct: number) => {
    setPercentage(pct);
    setAmount(((maxAmount * pct) / 100).toFixed(2));
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <Link href="/strategies">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Strategies
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center -space-x-2">
              {strategy.tokenIcons.map((icon, idx) => (
                <div
                  key={idx}
                  className="w-12 h-12 rounded-full bg-muted border-2 border-background flex items-center justify-center text-2xl"
                >
                  {icon}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold">{strategy.name}</h1>
                {strategy.isNew && <Badge variant="secondary">New</Badge>}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                <span className="text-sm uppercase font-medium">CHAIN</span>
                <Badge variant="outline">{strategy.chain}</Badge>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span className="text-sm uppercase font-medium">PLATFORM</span>
                <span className="text-sm">{strategy.protocol}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">
            <Button variant="outline" size="icon" className="flex-1 min-w-[48px] sm:flex-none md:flex-none">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="flex-1 min-w-[48px] sm:flex-none md:flex-none">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button className="flex-1 sm:flex-none md:flex-none">VAULT</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">TVL</div>
              <div className="text-2xl font-bold">{strategy.tvl}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                APY <Info className="h-3 w-3" />
              </div>
              <div className="text-2xl font-bold text-green-500">{strategy.currentApy.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                DAILY <Info className="h-3 w-3" />
              </div>
              <div className="text-2xl font-bold">{strategy.dailyYield.toFixed(4)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">YOUR DEPOSIT</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                <span>{formattedSusdsBalance}</span>
                <Badge variant="outline">sUSDS</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">LAST HARVEST</div>
              <div className="text-lg font-medium">20 minutes ago</div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Deposit/Withdraw */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "deposit" | "withdraw")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-4 mt-0">
                    {/* Chain Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        
                        Select chain
                      </Label>
                      <Select value={selectedChain || undefined} onValueChange={setSelectedChain}>
                        <SelectTrigger className="w-auto justify-between min-w-[6rem]">
                          <SelectValue placeholder="Chain" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockChains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>
                              <div className="flex items-center gap-2">
                                {chain.logo ? (
                                  <Image
                                    src={chain.logo}
                                    alt={`${chain.name} logo`}
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                  />
                                ) : (
                                  <span>{chain.icon}</span>
                                )}
                                <span className="font-medium">{chain.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {chain.network}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="text-2xl h-14 pr-24"
                        />
                        <div className="absolute right-2 top-3">
                          <Select value={selectedToken} onValueChange={setSelectedToken}>
                            <SelectTrigger className="w-auto justify-between min-w-[4rem]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mockTokens.map((token) => (
                                <SelectItem key={token.symbol} value={token.symbol}>
                                  <div className="flex items-center gap-2">
                                    {token.logo ? (
                                      <Image
                                        src={token.logo}
                                        alt={`${token.name} logo`}
                                        width={20}
                                        height={20}
                                        className="h-5 w-5"
                                      />
                                    ) : (
                                      <span>{token.icon}</span>
                                    )}
                                    <span>{token.symbol}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">$0</span>
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">0%</span>
                          {[25, 50, 75, 100].map((pct) => (
                            <Button
                              key={pct}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handlePercentage(pct)}
                            >
                              {pct}%
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* You deposit section */}
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground mb-2">You deposit</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">{+amount*3900 || "0"}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">USDS</span>
                          <span className="text-lg">{strategy.tokenIcons[0]}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">~$0</div>
                    </div>

                    {/* Switch to Chain Button */}
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      size="lg"
                      onClick={() => setIsWorkflowOpen(true)}
                    >
                      Let's go!
                    </Button>

                    <Separator />

                    {/* Fees */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          DEPOSIT FEE <Info className="h-3 w-3" />
                        </span>
                        <span>0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          WITHDRAWAL FEE <Info className="h-3 w-3" />
                        </span>
                        <span>0%</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        The displayed APY accounts for performance fee{" "}
                        <Info className="h-3 w-3 inline" /> that is deducted from the generated
                        yield only
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-4 mt-0">
                    <div className="text-center py-8 text-muted-foreground">
                      No deposits to withdraw
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Left Column - Charts & Info */}
          <div className="space-y-6 min-w-0">
            {/* Historical Rate Chart */}
            <HistoricalRateCard />

            {/* Safety Score */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Low-complexity strategy
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">Beefy</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Very low or zero expected IL
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">Asset</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      High market-capitalization, lower volatility asset
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">Asset</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Platform audited by trusted reviewer
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">Platform</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Project contracts are verified
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">Platform</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

            {/* Insurance Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Insurance</CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
      <Dialog open={isWorkflowOpen} onOpenChange={setIsWorkflowOpen}>
        <DialogContent
          variant="bottom-sheet"
          className="space-y-6 rounded-t-3xl p-5"
          showCloseButton={false}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Transaction Workflow</p>
              <p className="text-lg font-semibold text-foreground">Pending steps</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsWorkflowOpen(false)}>
              Close
            </Button>
          </div>

          {walletExecutionProvider ? (
            <TransactionWorkflowWidget
              steps={transactionWorkflowSteps}
              walletProvider={walletExecutionProvider}
              onComplete={handleWorkflowComplete}
              variant="minimal"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-muted-foreground/40 px-4 py-3 text-sm text-muted-foreground">
              Initializing wallet provider… ensure your wallet is connected and unlocked.
            </div>
          )}

          {!isWalletReady && (
            <p className="text-xs text-muted-foreground">
              Connect a wallet to run the workflow with your account. You can still preview the steps.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
