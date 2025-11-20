"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { formatUnits, parseUnits, zeroAddress } from "viem";
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
import { ChainType as LifiChainType, EVM, convertQuoteToRoute, createConfig, executeRoute, getQuote, type QuoteRequest, type RouteExtended, config as lifiConfig } from "@lifi/sdk";
import { arbitrum } from "viem/chains";
import { createContractCallStep, createLifiWorkflowSteps, type ContractCallStepMetadata } from "@/lib/lifi";
import type { ChainType as SupportedChainType } from "@/lib/types";

const LIFI_INTEGRATOR = "defi-one-click";

createConfig({
  integrator: LIFI_INTEGRATOR,
  preloadChains: true,
});

const BSC_CHAIN_ID = 56;
const SRC_CHAIN = arbitrum
const ARB_CHAIN_ID = SRC_CHAIN.id;
const ETHEREUM_CHAIN_ID = 1;
const BSC_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const ETH_NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";
const ETH_USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ARB_USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const ARB_USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const ETH_USDS_ADDERSS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
const BSC_USDT_DEC = 18
const FROM_AMOUNT = 0.0001
const SOURCE_CHAIN_TYPE: SupportedChainType = "arbitrum";
// const DESTINATION_CHAIN_TYPE: SupportedChainType = "arbitrum";
const DESTINATION_CHAIN_TYPE: SupportedChainType = "ethereum";
const CONTRACT_ADDRESS = "0xa3931d71877c0e7a3148cb7eb4463524fec27fbd";
const FUNCTION_SIG = "deposit(uint256,address,uint16)";
const CALL_VARS = [0.01, "0x3A805eaFD90f081BCe9dcC0dc9aaC6e9b3cD5F05", 1];
const DEFAULT_LIFI_SLIPPAGE = 0.003;
const DEST_TOKEN = ETH_USDS_ADDERSS;

const TEST_LIFI_STEPS: TransactionWorkflowStep[] = [
  {
    id: "lifi-get-quote",
    label: "Fetch LI.FI Route",
    action: "swap",
    description: "Request the best LI.FI route to move 1,000 USDT on BNB Chain to ETH on Ethereum.",
    fromChain: "arbitrum",
    toChain: "arbitrum",
    tokenIn: "ETH",
    tokenOut: "USDT",
    amount: FROM_AMOUNT,
    metadata: {
      fromChainId: SRC_CHAIN.id,
      toChainId: ETHEREUM_CHAIN_ID,
      fromTokenAddress: zeroAddress,
      toTokenAddress: DEST_TOKEN,
      decimals: BSC_USDT_DEC,
      fromAmount: parseUnits(`${FROM_AMOUNT}`, BSC_USDT_DEC).toString(),
    },
  },
  {
    id: "lifi-execute-route",
    label: "Execute LI.FI Swap & Bridge",
    action: "bridge",
    description: "Use the quoted LI.FI route to swap USDT on BNB Chain, bridge it, and receive ETH on Ethereum.",
    fromChain: "bsc",
    toChain: "ethereum",
    tokenIn: "USDT",
    tokenOut: "ETH",
    amount: 0.0000000001,
    metadata: {
      needsQuote: true,
      routeDescription: "Cross-chain swap via LI.FI smart routing",
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
  const [activeWalletClient, setActiveWalletClient] = useState<typeof walletClient | null>(null);

  useEffect(() => {
    setActiveWalletClient(walletClient ?? null);
  }, [walletClient]);

  useEffect(() => {
    if (!activeWalletClient) {
      return;
    }

    const provider = EVM({
      getWalletClient: async () => activeWalletClient,
      switchChain: async (chainId) => {
        if (!activeWalletClient.switchChain) {
          throw new Error("Connected wallet cannot switch chains programmatically.");
        }
        if (activeWalletClient.chain?.id !== chainId) {
          const switchedClient = await activeWalletClient.switchChain({ id: chainId });
          setActiveWalletClient(switchedClient);
          return switchedClient;
        }
        return activeWalletClient;
      },
    });

    lifiConfig.setProviders([provider]);

    return () => {
      const remainingProviders =
        lifiConfig.get().providers?.filter((p) => p.type !== LifiChainType.EVM) ?? [];
      if (remainingProviders.length) {
        lifiConfig.setProviders(remainingProviders);
      }
    };
  }, [activeWalletClient]);

  const [lifiSteps, setLifiSteps] = useState<TransactionWorkflowStep[]>(TEST_LIFI_STEPS);

  useEffect(() => {
    let isMounted = true;

    const buildSteps = async () => {
      try {
        const steps = await createLifiWorkflowSteps({
          sourceChain: SOURCE_CHAIN_TYPE,
          sourceTokenAddress: zeroAddress,
          fromAmount: FROM_AMOUNT,
          destinationChain: DESTINATION_CHAIN_TYPE,
          destinationTokenAddress: ARB_USDC_ADDRESS,
          slippage: DEFAULT_LIFI_SLIPPAGE,
        });

        steps.concat(createContractCallStep({
          chain: DESTINATION_CHAIN_TYPE,
          contractAddress: CONTRACT_ADDRESS,
          functionSignature: FUNCTION_SIG,
          variables: [],
          successMessage: "DONE!",
        }))

        if (isMounted) {
          setLifiSteps(steps);
        }
      } catch (error) {
        console.error("Failed to construct LI.FI workflow steps", error);
      }
    };

    void buildSteps();

    return () => {
      isMounted = false;
    };
  }, []);

  const transactionWorkflowSteps = useMemo<TransactionWorkflowStep[]>(() => {
    if (!activeWalletClient || !activeWalletClient.account) {
      return lifiSteps;
    }

    let cachedRoute: RouteExtended | null = null;

    const ensureWalletOnChain = async (chainId: number) => {
      if (!activeWalletClient.switchChain) {
        throw new Error("Connected wallet cannot switch chains programmatically.");
      }
      if (activeWalletClient.chain?.id !== chainId) {
        const switchedClient = await activeWalletClient.switchChain({ id: chainId });
        setActiveWalletClient(switchedClient);
        return switchedClient;
      }
      return activeWalletClient;
    };

    return lifiSteps.map((step) => {
      if (step.id === "lifi-get-quote") {
        return {
          ...step,
          async execute(_provider, currentStep) {
            const metadata = currentStep.metadata ?? {};
            const decimals = typeof metadata.decimals === "number" ? metadata.decimals : 6;
            const fromAmount =
              metadata.fromAmount ??
              parseUnits((currentStep.amount ?? 0).toString(), decimals).toString();
            const slippage =
              typeof metadata.slippage === "number" ? metadata.slippage : DEFAULT_LIFI_SLIPPAGE;

            const quoteRequest: QuoteRequest = {
              fromChain: metadata.fromChainId ?? BSC_CHAIN_ID,
              toChain: metadata.toChainId ?? ETHEREUM_CHAIN_ID,
              fromToken: metadata.fromTokenAddress ?? BSC_USDT_ADDRESS,
              toToken: metadata.toTokenAddress ?? ETH_NATIVE_ADDRESS,
              fromAddress: activeWalletClient.account.address,
              toAddress: activeWalletClient.account.address,
              fromAmount,
              slippage,
            };

            const quote = await getQuote(quoteRequest);
            cachedRoute = convertQuoteToRoute(quote);

            const estimatedOut =
              quote.estimate.toAmountMin && quote.action.toToken.decimals
                ? Number(formatUnits(BigInt(quote.estimate.toAmountMin), quote.action.toToken.decimals)).toFixed(6)
                : null;

            return {
              txHash: undefined,
              message: estimatedOut
                ? `Quote prepared via ${quote.toolDetails?.name ?? quote.tool}: ~${estimatedOut} ${
                    quote.action.toToken?.symbol ?? currentStep.tokenOut
                  }`
                : "Quote prepared via LI.FI",
            };
          },
        };
      }

      if (step.id === "lifi-execute-route") {
        return {
          ...step,
          async execute(_provider, currentStep) {
            if (!cachedRoute) {
              throw new Error("A LI.FI quote is required before executing the route.");
            }

            const firstChainId = cachedRoute.steps[0]?.action.fromChainId;
            if (firstChainId) {
              await ensureWalletOnChain(firstChainId);
            }

            const executedRoute = await executeRoute(cachedRoute, {
              switchChainHook: async (chainId) => {
                await ensureWalletOnChain(chainId);
                return activeWalletClient;
              },
              updateRouteHook(route) {
                cachedRoute = route;
              },
              acceptExchangeRateUpdateHook: async () => true,
            });

            cachedRoute = executedRoute;

            const lastStep = executedRoute.steps.at(-1);
            const lastProcess = lastStep?.execution?.process.at(-1);
            const receivedAmount =
              lastStep?.execution?.toAmount && lastStep.execution.toToken?.decimals
                ? Number(
                    formatUnits(
                      BigInt(lastStep.execution.toAmount),
                      lastStep.execution.toToken.decimals
                    )
                  ).toFixed(6)
                : null;

            return {
              txHash: lastProcess?.txHash,
              message:
                receivedAmount && lastStep?.execution?.toToken?.symbol
                  ? `Route executed. Received ~${receivedAmount} ${lastStep.execution.toToken.symbol}.`
                  : lastProcess?.message ?? `Route executed via ${currentStep.label}.`,
            };
          },
        };
      }

      if (step.metadata?.type === "contractCall") {
        return {
          ...step,
          async execute(_provider, currentStep) {
            const metadata = currentStep.metadata as ContractCallStepMetadata | undefined;
            if (!activeWalletClient || !metadata) {
              throw new Error("Wallet client is required to execute contract call steps.");
            }

            const walletClientForChain =
              (await ensureWalletOnChain(metadata.chainId)) ?? activeWalletClient;

            if (!walletClientForChain.account) {
              throw new Error("Active wallet client is missing an account.");
            }

            const txHash = await walletClientForChain.writeContract({
              account: walletClientForChain.account,
              address: metadata.contractAddress,
              abi: metadata.abi,
              functionName: metadata.functionName,
              args: metadata.args,
            });

            return {
              txHash,
              message:
                metadata.successMessage ??
                `Called ${metadata.functionName} on ${metadata.contractAddress}`,
            };
          },
        };
      }

      return step;
    });
  }, [activeWalletClient, lifiSteps]);

  const walletExecutionProvider = useMemo<WalletExecutionProvider | null>(() => {
    if (!activeWalletClient || !activeWalletClient.account) {
      // return null;
    }

    const address = activeWalletClient?.account.address ?? "";
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return {
      name: `Wallet ${shortAddress}`,
      async executeStep(step) {
        // Query the connected wallet's chain to prove we are talking to the wallet provider
        const chainIdHex = await activeWalletClient?.transport.request({ method: "eth_chainId" });
        const chainId = Number.parseInt(String(chainIdHex), 16);

        // TODO: Replace this mock delay with actual contract calls per step
        await new Promise((resolve) => setTimeout(resolve, 1200));

        return {
          txHash: `0x${step.id.slice(0, 6)}${Date.now().toString(16)}`,
          message: `${step.label} executed on chain #${Number.isNaN(chainId) ? "?" : chainId}`,
        };
      },
    };
  }, [activeWalletClient]);

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
