// DefiLlama API integration

export type Protocol = {
  id: string
  name: string
  address: string
  symbol: string
  url: string
  description: string
  chain: string
  logo: string
  audits: string
  audit_note: string | null
  gecko_id: string | null
  cmcId: string | null
  category: string
  chains: string[]
  oracles: string[]
  forkedFrom: string[]
  module: string
  twitter: string | null
  audit_links: string[]
  listedAt: number
  slug: string
  tvl: number
  chainTvls: Record<string, number>
  change_1h: number
  change_1d: number
  change_7d: number
  mcap: number
}

export type Pool = {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apyBase: number
  apyReward: number
  apy: number
  rewardTokens: string[]
  pool: string
  apyPct1D: number
  apyPct7D: number
  apyPct30D: number
  stablecoin: boolean
  ilRisk: string
  exposure: string
  predictions: {
    predictedClass: string
    predictedProbability: number
    binnedConfidence: number
  }
  poolMeta: string | null
  mu: number
  sigma: number
  count: number
  outlier: boolean
  underlyingTokens: string[]
  il7d: number
  apyBase7d: number
  apyMean30d: number
  volumeUsd1d: number
  volumeUsd7d: number
  apyBaseInception: number
}

export type HistoricalAPY = {
  timestamp: string
  apy: number
  apyBase: number
  apyReward: number
  tvlUsd: number
  il7d: number | null
  apyBase7d: number | null
}

// Fetch all protocols
export async function fetchProtocols(): Promise<Protocol[]> {
  try {
    const response = await fetch("https://api.llama.fi/protocols")
    if (!response.ok) throw new Error("Failed to fetch protocols")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching protocols:", error)
    return []
  }
}

// Fetch protocol details
export async function fetchProtocol(slug: string): Promise<Protocol | null> {
  try {
    const response = await fetch(`https://api.llama.fi/protocol/${slug}`)
    if (!response.ok) throw new Error("Failed to fetch protocol")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching protocol:", error)
    return null
  }
}

// Fetch all yield pools
export async function fetchPools(): Promise<Pool[]> {
  try {
    const response = await fetch("https://yields.llama.fi/pools")
    if (!response.ok) throw new Error("Failed to fetch pools")
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("[v0] Error fetching pools:", error)
    return []
  }
}

// Fetch historical APY for a specific pool
export async function fetchPoolHistory(poolId: string): Promise<HistoricalAPY[]> {
  try {
    const response = await fetch(`https://yields.llama.fi/chart/${poolId}`)
    if (!response.ok) throw new Error("Failed to fetch pool history")
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("[v0] Error fetching pool history:", error)
    return []
  }
}

// Fetch token data from DefiLlama
export async function fetchTokenData(symbol: string) {
  try {
    // Check if stablecoin
    const stablecoins = ["USDC", "DAI", "USDT", "TUSD", "PAX", "BUSD", "FRAXBP", "CRVUSD", "PYUSD", "MKUSD", "USDE"]
    const isStable = stablecoins.includes(symbol.toUpperCase())

    // For comprehensive data, you might need CoinGecko integration
    // For now, we'll return basic info
    return {
      symbol,
      isStable,
      marketCap: null, // Would need additional API
      hasRecentDepeg: false, // Would need stablecoin API endpoint
    }
  } catch (error) {
    console.error(`[v0] Error fetching token data for ${symbol}:`, error)
    return null
  }
}

// Transform pool data to strategy format
export function transformPoolToStrategy(pool: Pool, protocol?: Protocol) {
  const tokens = pool.underlyingTokens || [pool.symbol]
  const tokenIcons = tokens.slice(0, 3).map(() => "💎") // Placeholder, would need token icon mapping

  return {
    id: pool.pool,
    name: pool.symbol,
    protocol: pool.project,
    chain: pool.chain,
    currentApy: pool.apy || 0,
    dailyYield: (pool.apy || 0) / 365,
    tvl: formatTVL(pool.tvlUsd),
    tvlNumeric: pool.tvlUsd,
    category: pool.stablecoin ? "stablecoin" : "other",
    isStablecoin: pool.stablecoin,
    deposited: 0,
    tokenIcons,
    isNew: false,
    isBoosted: false,
    audits: protocol?.audits || "No audits",
    listedAt: protocol?.listedAt,
    volume24h: pool.volumeUsd1d,
    apyHistory: [],
    underlyingSymbols: tokens,
    rugged: false,
    safetyScore: 0, // Will be calculated
  }
}

function formatTVL(tvl: number): string {
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`
  if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(2)}K`
  return `$${tvl.toFixed(2)}`
}

export async function getTopPools(): Promise<Pool[]> {
  try {
    const response = await fetch(
      "https://pro-api.llama.fi/436bdb4b6a8ce3de2e703a424249c04a7833f2f23313d98f4afe6bc0ac4b20f1/yields/poolsOld?chain=ethereum&protocol=sky-lending&symbol=usds&limit=10",
    )
    if (!response.ok) throw new Error("Failed to fetch pools")

    const data = await response.json()
    const allPools = data.data || []

    // Filter and get top 2 from Base and Arbitrum by TVL
    const basePools = allPools
      .filter((pool: Pool) => pool.chain.toLowerCase() === "base")
      .sort((a: Pool, b: Pool) => b.tvlUsd - a.tvlUsd)
      .slice(0, 2)

    const arbitrumPools = allPools
      .filter((pool: Pool) => pool.chain.toLowerCase() === "arbitrum")
      .sort((a: Pool, b: Pool) => b.tvlUsd - a.tvlUsd)
      .slice(0, 2)

    return allPools
  } catch (error) {
    console.error("[v0] Error fetching top pools:", error)
    return []
  }
}
