import { createPublicClient, erc20Abi, http, parseUnits, zeroAddress } from "viem";
import type { PublicClient } from "viem";
import type { TransactionWorkflowStep } from "@/components/execute/transaction-workflow-widget";
import { type ChainType, VIEM_CHAINS } from "@/lib/types";

const publicClientCache = new Map<ChainType, PublicClient>();

const getPublicClient = (chain: ChainType): PublicClient => {
  const cachedClient = publicClientCache.get(chain);
  if (cachedClient) {
    return cachedClient;
  }

  const chainConfig = VIEM_CHAINS[chain];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const client = createPublicClient({
    chain: chainConfig,
    transport: http(),
  });
  publicClientCache.set(chain, client);
  return client;
};

const NATIVE_TOKEN_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
]);

const isNativeToken = (address: string) => {
  return NATIVE_TOKEN_ADDRESSES.has(address.toLowerCase());
};

const fetchTokenDecimals = async (chain: ChainType, tokenAddress: string): Promise<number> => {
  const chainConfig = VIEM_CHAINS[chain];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  if (!tokenAddress || isNativeToken(tokenAddress)) {
    return chainConfig.nativeCurrency.decimals ?? 18;
  }

  const client = getPublicClient(chain);
  const decimals = await client.readContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
  });

  if (typeof decimals !== "number" && typeof decimals !== "bigint") {
    throw new Error(`Failed to fetch decimals for ${tokenAddress} on ${chain}`);
  }

  return Number(decimals);
};

export interface CreateLifiWorkflowParams {
  sourceChain: ChainType;
  sourceTokenAddress: string;
  fromAmount: number;
  destinationChain: ChainType;
  destinationTokenAddress: string;
  slippage: number;
}

export const createLifiWorkflowSteps = async ({
  sourceChain,
  sourceTokenAddress,
  fromAmount,
  destinationChain,
  destinationTokenAddress,
  slippage,
}: CreateLifiWorkflowParams): Promise<TransactionWorkflowStep[]> => {
  const sourceChainConfig = VIEM_CHAINS[sourceChain];
  const destinationChainConfig = VIEM_CHAINS[destinationChain];

  if (!sourceChainConfig || !destinationChainConfig) {
    throw new Error("Both source and destination chains must be supported VIEM chains.");
  }

  const decimals = await fetchTokenDecimals(sourceChain, sourceTokenAddress);
  const formattedAmount = parseUnits(fromAmount.toString(), decimals).toString();

  const quoteStep: TransactionWorkflowStep = {
    id: "lifi-get-quote",
    label: "Fetch LI.FI Route",
    action: "swap",
    description: `Prepare LI.FI route from ${sourceChain} to ${destinationChain}`,
    fromChain: sourceChain,
    toChain: sourceChain,
    amount: fromAmount,
    metadata: {
      fromChainId: sourceChainConfig.id,
      toChainId: destinationChainConfig.id,
      fromTokenAddress: sourceTokenAddress ?? zeroAddress,
      toTokenAddress: destinationTokenAddress,
      decimals,
      fromAmount: formattedAmount,
      slippage,
    },
  };

  const executeStep: TransactionWorkflowStep = {
    id: "lifi-execute-route",
    label: "Execute LI.FI Swap & Bridge",
    action: "bridge",
    description: "Execute the quoted LI.FI route",
    fromChain: sourceChain,
    toChain: destinationChain,
    metadata: {
      needsQuote: true,
      routeDescription: "Cross-chain swap via LI.FI smart routing",
    },
  };

  return [quoteStep, executeStep];
};
