"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Search, Filter } from 'lucide-react';
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { StrategiesHeader } from "@/components/strategies/strategies-header";
import { StrategiesFilters } from "@/components/strategies/strategies-filters";
import { StrategiesTable } from "@/components/strategies/strategies-table";
import { TransactionWorkflowWidget, type TransactionWorkflowStep, type WalletExecutionProvider } from "@/components/execute/transaction-workflow-widget";
import { mockStrategies } from "@/lib/mock-data";
import { VIEM_CHAINS } from "@/lib/types";

const TEST_WORKFLOW_STEPS: TransactionWorkflowStep[] = [
  {
    id: "approve-usdt",
    label: "Approve USDT",
    action: "approve",
    description: "Allow the Hyperlane bridge contract to spend 1,000 USDC on Ethereum.",
    fromChain: "bsc",
    tokenIn: "USDT",
    amount: 1000,
    metadata: {
      spender: "0x111111111117dC0aa78b770fA6A738034120C302",
      token: "0x55d398326f99059fF775485246999027B3197955",
      intent: "Increase allowance for router",
      decimals: 6,
    },
  },
  {
    id: "bridge-to-base",
    label: "Bridge USDC to Base",
    action: "bridge",
    description: "Move the approved balance from Ethereum to Base via Hyperlane.",
    fromChain: "ethereum",
    toChain: "base",
    tokenIn: "USDC",
    tokenOut: "USDC",
    amount: 1000,
    metadata: {
      bridge: "Hyperlane",
      destinationAddress: "0xBaseWallet",
      slippage: "0.10%",
    },
  },
  {
    id: "stake-on-aave",
    label: "Stake on Aave",
    action: "stake",
    description: "Deposit bridged USDC into the Base Aave market to earn yield.",
    fromChain: "base",
    tokenIn: "USDC",
    tokenOut: "aUSDC",
    amount: 1000,
    metadata: {
      protocol: "Aave v3",
      market: "Base",
      strategy: "Intent demo",
    },
  },
];

export default function StrategiesPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTestWidget, setShowTestWidget] = useState(false);

  const transactionWorkflowSteps = useMemo<TransactionWorkflowStep[]>(() => {
    if (!walletClient) {
      return TEST_WORKFLOW_STEPS;
    }

    return TEST_WORKFLOW_STEPS.map((step) => {
      if (step.id !== "approve-usdt") {
        return step;
      }

      return {
        ...step,
        async execute(_provider, currentStep) {
          const targetChain =
            currentStep.fromChain && currentStep.fromChain !== "solana"
              ? VIEM_CHAINS[currentStep.fromChain]
              : undefined;

          if (targetChain && walletClient.chain?.id !== targetChain.id) {
            try {
              await walletClient.switchChain({ id: targetChain.id });
            } catch (switchError) {
              console.error("Failed to switch chain", switchError);
              throw new Error(`Please switch your wallet to ${targetChain.name} to continue.`);
            }
          }

          const metadata = currentStep.metadata ?? {};
          const tokenAddress = metadata.token as `0x${string}` | undefined;
          const spenderAddress = metadata.spender as `0x${string}` | undefined;
          if (!tokenAddress || !spenderAddress) {
            throw new Error("Missing token or spender address for approval step");
          }

          const decimals = typeof metadata.decimals === "number" ? metadata.decimals : 18;
          const nominalAmount = currentStep.amount ?? 0;
          if (!nominalAmount || Number.isNaN(nominalAmount)) {
            throw new Error("Approval amount is invalid");
          }

          const amountToApprove = parseUnits(nominalAmount.toString(), decimals);

          console.log(walletClient.chain.id, "chain")
          console.log({amountToApprove, spenderAddress})

          const txHash = await walletClient.writeContract({
            chain: targetChain,
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [spenderAddress, amountToApprove],
            // account: walletClient.account,
          });

          return {
            txHash,
            message: `${currentStep.label} broadcast from ${walletClient.account.address}`,
          };
        },
      };
    });
  }, [walletClient]);

  const walletExecutionProvider = useMemo<WalletExecutionProvider | null>(() => {
    if (!walletClient || !walletClient.account) {
      return null;
    }

    const address = walletClient.account.address;
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return {
      name: `Wallet ${shortAddress}`,
      async executeStep(step) {
        // Query the connected wallet's chain to prove we are talking to the wallet provider
        const chainIdHex = await walletClient.transport.request({ method: "eth_chainId" });
        const chainId = Number.parseInt(String(chainIdHex), 16);

        // TODO: Replace this mock delay with actual contract calls per step
        await new Promise((resolve) => setTimeout(resolve, 1200));

        return {
          txHash: `0x${step.id.slice(0, 6)}${Date.now().toString(16)}`,
          message: `${step.label} executed on chain #${Number.isNaN(chainId) ? "?" : chainId}`,
        };
      },
    };
  }, [walletClient]);

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

        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              variant={showTestWidget ? "secondary" : "outline"}
              onClick={() => setShowTestWidget((prev) => !prev)}
              className="font-medium"
            >
              test tx widget
            </Button>
          </div>

          {showTestWidget && (
            walletExecutionProvider ? (
              <TransactionWorkflowWidget
                steps={transactionWorkflowSteps}
                walletProvider={walletExecutionProvider}
              />
            ) : (
              <Card className="border-dashed border-muted-foreground/40 bg-muted/30">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Initializing wallet provider… ensure your wallet is connected and unlocked.
                </CardContent>
              </Card>
            )
          )}
        </div>

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
