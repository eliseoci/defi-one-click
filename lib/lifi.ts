import { createPublicClient, erc20Abi, http, parseAbiItem, parseUnits, zeroAddress } from "viem";
import type { Abi, Address, PublicClient } from "viem";
import type { TransactionWorkflowStep } from "@/components/execute/transaction-workflow-widget";
import { type ChainType, VIEM_CHAINS } from "@/lib/types";

const publicClientCache = new Map<ChainType, PublicClient>();

export const getPublicClient = (chain: ChainType): PublicClient => {
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

const sanitizeStepId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "-");

const normalizeFunctionSignature = (signature: string) => {
  const trimmed = signature.trim();
  return trimmed.startsWith("function") ? trimmed : `function ${trimmed}`;
};

export interface ContractCallStepMetadata {
  type: "contractCall";
  chain: ChainType;
  chainId: number;
  contractAddress: Address;
  functionSignature: string;
  functionName: string;
  abi: Abi;
  args: readonly unknown[];
  successMessage?: string;
}

export interface CreateContractCallStepParams {
  chain: ChainType;
  contractAddress: Address;
  functionSignature: string;
  variables?: readonly unknown[];
  label?: string;
  description?: string;
  successMessage?: string;
}

export const createContractCallStep = ({
  chain,
  contractAddress,
  functionSignature,
  variables = [],
  label,
  description,
  successMessage,
}: CreateContractCallStepParams): TransactionWorkflowStep => {
  const chainConfig = VIEM_CHAINS[chain];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const normalizedSignature = normalizeFunctionSignature(functionSignature);
  const abiItem = parseAbiItem(normalizedSignature);
  const abi = [abiItem] as const satisfies Abi;
  const generatedId = sanitizeStepId(
    `contract-call-${chain}-${contractAddress}-${abiItem.name ?? "fn"}`
  );

  const metadata: ContractCallStepMetadata = {
    type: "contractCall",
    chain,
    chainId: chainConfig.id,
    contractAddress,
    functionSignature: normalizedSignature,
    functionName: abiItem.name ?? "contractCall",
    abi,
    args: variables,
    successMessage,
  };

  console.log({generatedId})

  return {
    id: generatedId,
    label: label ?? `Call ${metadata.functionName}`,
    description: description ?? `Invoke ${metadata.functionName} on ${chain}`,
    action: "contract",
    fromChain: chain,
    toChain: chain,
    metadata,
  };
};

export interface TokenApprovalStepMetadata {
  type: "tokenApproval";
  chain: ChainType;
  chainId: number;
  tokenAddress: Address;
  spenderAddress: Address;
  decimals: number;
  requiredAmount: string;
  tokenSymbol?: string;
  successMessage?: string;
}

export interface CreateTokenApprovalStepParams {
  chain: ChainType;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: number | string;
  tokenSymbol?: string;
  label?: string;
  description?: string;
  successMessage?: string;
}

export const createTokenApprovalStep = async ({
  chain,
  tokenAddress,
  spenderAddress,
  amount,
  tokenSymbol,
  label,
  description,
  successMessage,
}: CreateTokenApprovalStepParams): Promise<TransactionWorkflowStep | null> => {
  if (isNativeToken(tokenAddress)) {
    return null;
  }

  const chainConfig = VIEM_CHAINS[chain];
  if (!chainConfig) {
    throw new Error(`Unsupported chain ${chain}`);
  }

  const decimals = await fetchTokenDecimals(chain, tokenAddress);
  const amountAsString =
    typeof amount === "number" ? amount.toString() : amount.toString();
  const requiredAmount = parseUnits(amountAsString, decimals);

  const metadata: TokenApprovalStepMetadata = {
    type: "tokenApproval",
    chain,
    chainId: chainConfig.id,
    tokenAddress,
    spenderAddress,
    decimals,
    requiredAmount: requiredAmount.toString(),
    tokenSymbol,
    successMessage,
  };

  return {
    id: sanitizeStepId(`approve-${chain}-${tokenAddress}-${spenderAddress}`),
    label: label ?? `Approve ${tokenSymbol ?? "token"}`,
    description:
      description ?? `Ensure ${spenderAddress.slice(0, 6)} can spend ${tokenSymbol ?? "token"}`,
    action: "approve",
    fromChain: chain,
    toChain: chain,
    metadata,
  };
};
