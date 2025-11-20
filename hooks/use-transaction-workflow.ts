import { useEffect, useMemo, useState } from "react";
import { useWalletClient } from "wagmi";
import { erc20Abi, formatUnits, parseUnits, zeroAddress } from "viem";
import type { Address } from "viem";
import { arbitrum } from "viem/chains";
import {
  ChainType as LifiChainType,
  EVM,
  config as lifiConfig,
  convertQuoteToRoute,
  createConfig,
  executeRoute,
  getQuote,
  type QuoteRequest,
  type RouteExtended,
} from "@lifi/sdk";
import {
  createContractCallStep,
  createLifiWorkflowSteps,
  createTokenApprovalStep,
  getPublicClient,
  type ContractCallStepMetadata,
  type TokenApprovalStepMetadata,
} from "@/lib/lifi";
import type { ChainType as SupportedChainType } from "@/lib/types";
import type {
  TransactionWorkflowStep,
  WalletExecutionProvider,
} from "@/components/execute/transaction-workflow-widget";

const LIFI_INTEGRATOR = "defi-one-click";

createConfig({
  integrator: LIFI_INTEGRATOR,
  preloadChains: true,
});

const BSC_CHAIN_ID = 56;
const SRC_CHAIN = arbitrum;
const ARB_CHAIN_ID = SRC_CHAIN.id;
const ETHEREUM_CHAIN_ID = 1;
const BSC_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const ETH_NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";
const ETH_USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ARB_USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const ARB_USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const ETH_USDS_ADDERSS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
const BSC_USDT_DEC = 18;
const FROM_AMOUNT = 0.000001;
const SOURCE_TOKEN_ADDRESS: Address = zeroAddress;
const SOURCE_TOKEN_SYMBOL = "ETH";
const SOURCE_CHAIN_TYPE: SupportedChainType = "arbitrum";
const DESTINATION_CHAIN_TYPE: SupportedChainType = "ethereum";
const CONTRACT_ADDRESS = "0xa3931d71877c0e7a3148cb7eb4463524fec27fbd";
const FUNCTION_SIG = "deposit(uint256,address,uint16)";
const CALL_VARS = [0.29 * 1e18, "0x3A805eaFD90f081BCe9dcC0dc9aaC6e9b3cD5F05", 1];
const DEFAULT_LIFI_SLIPPAGE = 0.003;
const DEST_TOKEN = ETH_USDS_ADDERSS;
const MOCK_REJECTED_TX_HASH =
  "0x9834ba2b00b417ed4cecb75f064afab608f0787dc98968f85e031072127f89df";
const USER_REJECTION_ERROR_CODE = 4001;
const USER_REJECTED_MESSAGE = /user rejected/i;

const isUserRejectedError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if (typeof error === "string") {
    return USER_REJECTED_MESSAGE.test(error);
  }

  if (typeof error === "object") {
    const nestedError = error as {
      code?: number;
      message?: string;
      cause?: unknown;
      error?: unknown;
    };

    if (typeof nestedError.code === "number" && nestedError.code === USER_REJECTION_ERROR_CODE) {
      return true;
    }

    if (typeof nestedError.message === "string" && USER_REJECTED_MESSAGE.test(nestedError.message)) {
      return true;
    }

    if (nestedError.cause && isUserRejectedError(nestedError.cause)) {
      return true;
    }

    if (nestedError.error && isUserRejectedError(nestedError.error)) {
      return true;
    }
  }

  return false;
};

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

export function useTransactionWorkflow() {
  const { data: walletClient } = useWalletClient();
  const [activeWalletClient, setActiveWalletClient] = useState<typeof walletClient | null>(null);
  const [lifiSteps, setLifiSteps] = useState<TransactionWorkflowStep[]>(TEST_LIFI_STEPS);

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

  useEffect(() => {
    let isMounted = true;

    const buildSteps = async () => {
      try {
        const lifiRouteSteps = await createLifiWorkflowSteps({
          sourceChain: SOURCE_CHAIN_TYPE,
          sourceTokenAddress: SOURCE_TOKEN_ADDRESS,
          fromAmount: FROM_AMOUNT,
          destinationChain: DESTINATION_CHAIN_TYPE,
          destinationTokenAddress: DEST_TOKEN,
          slippage: DEFAULT_LIFI_SLIPPAGE,
        });

        const approvalStep = await createTokenApprovalStep({
          chain: DESTINATION_CHAIN_TYPE,
          tokenAddress: DEST_TOKEN,
          spenderAddress: CONTRACT_ADDRESS,
          amount: +CALL_VARS[0] / 1e18,
          tokenSymbol: "IDK",
          label: "Check Token Approval",
          description: "Verify the router can spend your input token.",
          successMessage: "Token approval ready for LI.FI route.",
        });

        const callStep = createContractCallStep({
          chain: DESTINATION_CHAIN_TYPE,
          contractAddress: CONTRACT_ADDRESS,
          functionSignature: FUNCTION_SIG,
          variables: CALL_VARS,
          successMessage: "DONE!",
        });

        const combinedSteps = [...lifiRouteSteps, ...(approvalStep ? [approvalStep] : []), callStep];

        if (isMounted) {
          setLifiSteps(combinedSteps);
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
                ? Number(
                    formatUnits(
                      BigInt(quote.estimate.toAmountMin),
                      quote.action.toToken.decimals
                    )
                  ).toFixed(6)
                : null;

            return {
              txHash: undefined,
              message: estimatedOut
                ? `Quote prepared via ${
                    quote.toolDetails?.name ?? quote.tool
                  }: ~${estimatedOut} ${quote.action.toToken?.symbol ?? currentStep.tokenOut}`
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

            try {
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
            } catch (error) {
              if (isUserRejectedError(error)) {
                return {
                  txHash: MOCK_REJECTED_TX_HASH,
                  message: "Transaction rejected in wallet. Continuing workflow.",
                };
              }

              throw error;
            }
          },
        };
      }

      if (step.metadata?.type === "tokenApproval") {
        return {
          ...step,
          async execute(_provider, currentStep) {
            const metadata = currentStep.metadata as TokenApprovalStepMetadata | undefined;

            if (!metadata || !activeWalletClient || !activeWalletClient.account) {
              throw new Error("Wallet client and approval metadata are required.");
            }

            const owner = activeWalletClient.account.address;
            const requiredAmount = BigInt(metadata.requiredAmount);
            const publicClient = getPublicClient(metadata.chain);

            const currentAllowance = await publicClient.readContract({
              address: metadata.tokenAddress,
              abi: erc20Abi,
              functionName: "allowance",
              args: [owner, metadata.spenderAddress],
            });

            if (currentAllowance >= requiredAmount) {
              return {
                txHash: undefined,
                message: metadata.successMessage ?? "Allowance already sufficient.",
              };
            }

            const walletClientForChain =
              (await ensureWalletOnChain(metadata.chainId)) ?? activeWalletClient;

            if (!walletClientForChain.account) {
              throw new Error("Active wallet client is missing an account.");
            }

            const txHash = await walletClientForChain.writeContract({
              account: walletClientForChain.account,
              address: metadata.tokenAddress,
              abi: erc20Abi,
              functionName: "approve",
              args: [metadata.spenderAddress, requiredAmount],
            });

            return {
              txHash,
              message:
                metadata.successMessage ??
                `Approved ${metadata.tokenSymbol ?? "token"} for router ${metadata.spenderAddress}`,
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
      return null;
    }

    const address = activeWalletClient.account.address;
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return {
      name: `Wallet ${shortAddress}`,
      async executeStep(step) {
        const chainIdHex = await activeWalletClient.transport.request({ method: "eth_chainId" });
        const chainId = Number.parseInt(String(chainIdHex), 16);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        return {
          txHash: `0x${step.id.slice(0, 6)}${Date.now().toString(16)}`,
          message: `${step.label} executed on chain #${Number.isNaN(chainId) ? "?" : chainId}`,
        };
      },
    };
  }, [activeWalletClient]);

  return {
    transactionWorkflowSteps,
    walletExecutionProvider,
    isWalletReady: Boolean(walletExecutionProvider),
  };
}
