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
  // Security score data fields
  audits: string;
  rugged: boolean;
  listedAt?: number;
  volume24h?: number;
  apyHistory?: Array<{apy: number, time: number}>;
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
    safetyScore: 75,
    category: 'vault',
    isBoosted: true,
    audits: '2 Audits',
    rugged: false,
    listedAt: Date.now() / 1000 - (365 * 24 * 3600), // 1 year old
    volume24h: 5000000,
    apyHistory: [
      { apy: 17.5, time: Date.now() / 1000 - (30 * 24 * 3600) },
      { apy: 18.2, time: Date.now() / 1000 - (20 * 24 * 3600) },
      { apy: 17.87, time: Date.now() / 1000 }
    ]
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
    safetyScore: 72,
    category: 'vault',
    isBoosted: true,
    audits: '1 Audit',
    rugged: false,
    listedAt: Date.now() / 1000 - (200 * 24 * 3600),
    volume24h: 3000000,
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
    safetyScore: 88,
    category: 'stablecoin',
    audits: '3 Audits',
    rugged: false,
    listedAt: Date.now() / 1000 - (800 * 24 * 3600), // 2+ years
    volume24h: 55000000,
    apyHistory: [
      { apy: 22.1, time: Date.now() / 1000 - (30 * 24 * 3600) },
      { apy: 22.5, time: Date.now() / 1000 - (20 * 24 * 3600) },
      { apy: 22.32, time: Date.now() / 1000 }
    ]
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
    safetyScore: 85,
    category: 'stablecoin',
    audits: '3 Audits',
    rugged: false,
    listedAt: Date.now() / 1000 - (900 * 24 * 3600),
    volume24h: 12000000,
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
    safetyScore: 45,
    category: 'single',
    isNew: true,
    audits: '1 Audit',
    rugged: false,
    listedAt: Date.now() / 1000 - (30 * 24 * 3600), // 1 month old
    volume24h: 200000,
    apyHistory: [
      { apy: 65.0, time: Date.now() / 1000 - (20 * 24 * 3600) },
      { apy: 80.5, time: Date.now() / 1000 - (10 * 24 * 3600) },
      { apy: 71.98, time: Date.now() / 1000 }
    ]
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
    safetyScore: 90,
    category: 'stablecoin',
    audits: '3 Audits',
    rugged: false,
    listedAt: Date.now() / 1000 - (1000 * 24 * 3600),
    volume24h: 8000000,
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
    safetyScore: 95,
    category: 'bluechip',
    audits: '4 Audits',
    rugged: false,
    listedAt: Date.now() / 1000 - (1500 * 24 * 3600), // 4+ years
    volume24h: 150000000,
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
    safetyScore: 92,
    category: 'stablecoin',
    audits: '3 Audits',
    rugged: false,
    listedAt: Date.now() / 1000 - (1200 * 24 * 3600),
    volume24h: 60000000,
  },
];

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  chain: string;
}

export const mockTokens: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', balance: 2.45, chain: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', balance: 5000, chain: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether', icon: '💲', balance: 3200, chain: 'Ethereum' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '₿', balance: 0.15, chain: 'Ethereum' },
  { symbol: 'DAI', name: 'Dai', icon: '💰', balance: 1500, chain: 'Ethereum' },
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
