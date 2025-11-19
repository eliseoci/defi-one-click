import type { Chain } from 'viem';
import { arbitrum, base, bsc, mainnet, optimism, polygon } from 'viem/chains';

export const VIEM_CHAINS = {
  ethereum: mainnet,
  arbitrum,
  optimism,
  polygon,
  base,
  bsc,
} as const satisfies Record<string, Chain>;

export type ChainType = keyof typeof VIEM_CHAINS | 'solana';
export type TransactionStatus = 'pending' | 'confirming' | 'completed' | 'failed' | 'cancelled';
export type ActionType = 'bridge' | 'swap' | 'stake' | 'unstake' | 'compound';

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  chain: ChainType;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioPosition {
  id: string;
  wallet_id: string;
  chain: ChainType;
  token_symbol: string;
  token_address: string;
  balance: string;
  usd_value: string | null;
  last_updated: string;
  created_at: string;
}

export interface StakingPosition {
  id: string;
  wallet_id: string;
  chain: ChainType;
  protocol: string;
  token_symbol: string;
  staked_amount: string;
  rewards_earned: string;
  apy: string | null;
  usd_value: string | null;
  started_at: string;
  last_claim: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  tx_hash: string | null;
  action: ActionType;
  status: TransactionStatus;
  from_chain: ChainType;
  to_chain: ChainType | null;
  from_token: string;
  to_token: string | null;
  from_amount: string;
  to_amount: string | null;
  gas_fee: string | null;
  bridge_fee: string | null;
  swap_fee: string | null;
  estimated_time_seconds: number | null;
  error_message: string | null;
  simulation_data: any;
  metadata: any;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  steps: any;
  is_favorite: boolean;
  times_executed: number;
  last_executed: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

export interface ChainInfo {
  id: ChainType;
  name: string;
  icon: string;
  color: string;
  nativeToken: string;
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA', nativeToken: 'ETH' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '◆', color: '#28A0F0', nativeToken: 'ETH' },
  { id: 'optimism', name: 'Optimism', icon: '✓', color: '#FF0420', nativeToken: 'ETH' },
  { id: 'polygon', name: 'Polygon', icon: '◇', color: '#8247E5', nativeToken: 'MATIC' },
  { id: 'base', name: 'Base', icon: '■', color: '#0052FF', nativeToken: 'ETH' },
  { id: 'bsc', name: 'BNB Chain', icon: '⬡', color: '#F0B90B', nativeToken: 'BNB' },
  { id: 'solana', name: 'Solana', icon: '◎', color: '#14F195', nativeToken: 'SOL' },
];
