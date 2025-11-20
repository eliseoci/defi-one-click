export interface Strategy {
  id: string;
  name: string;
  protocol: string;
  protocolType: string;
  tags: string[];
  currentApy: number;
  dailyYield: number;
  tvl: string;
  tvlNumeric: number;
  deposited: number;
  chain: string;
  tokenIcons: string[];
  safetyScore: number; // 1-5
  category: 'stablecoin' | 'bluechip' | 'meme' | 'lp' | 'single' | 'clm' | 'vault';
  isNew?: boolean;
  isBoosted?: boolean;
}

export const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'sUSDe-HONEY',
    protocol: 'KODIAK',
    protocolType: 'INFRARED',
    tags: ['VAULT', 'POINTS'],
    currentApy: 17.87,
    dailyYield: 0.045,
    tvl: '$8.09M',
    tvlNumeric: 8090000,
    deposited: 0,
    chain: 'Arbitrum',
    tokenIcons: ['💲', '🍯'],
    safetyScore: 4,
    category: 'vault',
    isBoosted: true,
  },
  {
    id: '2',
    name: 'USDe-HONEY',
    protocol: 'KODIAK',
    protocolType: 'INFRARED',
    tags: ['VAULT', 'POINTS'],
    currentApy: 16.95,
    dailyYield: 0.0429,
    tvl: '$4.23M',
    tvlNumeric: 4230000,
    deposited: 0,
    chain: 'Arbitrum',
    tokenIcons: ['💵', '🍯'],
    safetyScore: 4,
    category: 'vault',
    isBoosted: true,
  },
  {
    id: '3',
    name: 'frxUSD/msUSD',
    protocol: 'CURVE',
    protocolType: '',
    tags: ['VAULT'],
    currentApy: 22.32,
    dailyYield: 0.0552,
    tvl: '$2.75M',
    tvlNumeric: 2750000,
    deposited: 0,
    chain: 'Ethereum',
    tokenIcons: ['💰', '💵'],
    safetyScore: 5,
    category: 'stablecoin',
  },
  {
    id: '4',
    name: 'reUSD/sfrxUSD',
    protocol: 'CURVE',
    protocolType: 'CONVEX',
    tags: ['VAULT'],
    currentApy: 12.09,
    dailyYield: 0.0313,
    tvl: '$3.32M',
    tvlNumeric: 3320000,
    deposited: 0,
    chain: 'Ethereum',
    tokenIcons: ['🔄', '💲'],
    safetyScore: 5,
    category: 'stablecoin',
  },
  {
    id: '5',
    name: 'splUSD 29Jan26',
    protocol: 'PENDLE',
    protocolType: 'MAGPIE',
    tags: ['VAULT'],
    currentApy: 71.98,
    dailyYield: 0.1863,
    tvl: '$269.779',
    tvlNumeric: 269779,
    deposited: 0,
    chain: 'Ethereum',
    tokenIcons: ['💲'],
    safetyScore: 3,
    category: 'single',
    isNew: true,
  },
  {
    id: '6',
    name: 'PYUSD/crvUSD',
    protocol: 'CURVE',
    protocolType: '',
    tags: ['VAULT'],
    currentApy: 2.86,
    dailyYield: 0.0077,
    tvl: '$2.81M',
    tvlNumeric: 2810000,
    deposited: 0,
    chain: 'Ethereum',
    tokenIcons: ['💵', '💱'],
    safetyScore: 5,
    category: 'stablecoin',
  },
  {
    id: '7',
    name: 'ETH-WBTC',
    protocol: 'UNISWAP',
    protocolType: 'V3',
    tags: ['LP', 'CLM'],
    currentApy: 15.42,
    dailyYield: 0.0412,
    tvl: '$125.4M',
    tvlNumeric: 125400000,
    deposited: 0,
    chain: 'Ethereum',
    tokenIcons: ['⟠', '₿'],
    safetyScore: 5,
    category: 'bluechip',
  },
  {
    id: '8',
    name: 'USDC-USDT',
    protocol: 'BALANCER',
    protocolType: '',
    tags: ['VAULT', 'POINTS'],
    currentApy: 8.23,
    dailyYield: 0.0221,
    tvl: '$45.2M',
    tvlNumeric: 45200000,
    deposited: 0,
    chain: 'Polygon',
    tokenIcons: ['💵', '💲'],
    safetyScore: 5,
    category: 'stablecoin',
  },
];

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  logo?: string;
  balance: number;
  chain: string;
}

export const mockTokens: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', logo: '/icons/chains/ethereum-eth-logo.svg', balance: 2.45, chain: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', logo: '/icons/tokens/usd-coin-usdc-logo.svg', balance: 5000, chain: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether', icon: '💲', logo: '/icons/tokens/tether-usdt-logo.svg', balance: 3200, chain: 'Ethereum' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '₿', logo: '/icons/tokens/bitcoin-btc-logo.svg', balance: 0.15, chain: 'Ethereum' },
  { symbol: 'DAI', name: 'Dai', icon: '💰', logo: '/icons/tokens/multi-collateral-dai-dai-logo.svg', balance: 1500, chain: 'Ethereum' },
];

export interface Chain {
  id: string;
  name: string;
  icon: string;
  network: string;
  logo?: string;
}

export const mockChains: Chain[] = [
  { id: 'eth', name: 'Ethereum', icon: '⟠', logo: '/icons/chains/ethereum-eth-logo.svg', network: 'Mainnet' },
  { id: 'arb', name: 'Arbitrum', icon: '🌀', logo: '/icons/chains/arbitrum-arb-logo.svg', network: 'Rollup' },
  { id: 'poly', name: 'Polygon', icon: '🔺', logo: '/icons/chains/polygon-matic-logo.svg', network: 'PoS' },
  { id: 'bsc', name: 'BNB Chain', icon: '⚡', logo: '/icons/chains/bnb-bnb-logo.svg', network: 'BSC' },
];

export interface HistoricalRate {
  date: string;
  apy: number;
  tvl: number;
}

export const mockHistoricalRates: HistoricalRate[] = [
  { date: '26/9', apy: 17.31, tvl: 7.8 },
  { date: '3/10', apy: 13.6, tvl: 8.2 },
  { date: '10/10', apy: 6.17, tvl: 7.9 },
  { date: '17/10', apy: 18.2, tvl: 8.5 },
  { date: '24/10', apy: 6.39, tvl: 8.1 },
  { date: '31/10', apy: 8.8, tvl: 8.3 },
  { date: '7/11', apy: 15.2, tvl: 8.0 },
  { date: '14/11', apy: 6.39, tvl: 8.09 },
];
