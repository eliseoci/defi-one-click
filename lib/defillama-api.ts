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
  apy: number
  apyBase: number | null
  apyBase7d: number | null
  apyBaseInception: number | null
  apyMean30d: number
  apyMeanExpanding: number
  apyPct1D: number
  apyPct30D: number
  apyPct7D: number
  apyReward: number | null
  apyStdExpanding: number
  chain: string
  chain_factorized: number
  count: number
  exposure: string
  il7d: number | null
  ilRisk: string
  mu: number
  outlier: boolean
  pool: string
  poolAddress: string
  poolMeta: string | null
  pool_old: string
  predictions: {
    binnedConfidence: number
    predictedClass: string
    predictedProbability: number
  }
  project: string
  project_factorized: number
  protocolMeta: string | null
  return: number
  rewardTokens: string[] | null
  securityScore: number
  sigma: number
  stablecoin: boolean
  symbol: string
  timestamp: string
  tvlUsd: number
  underlyingTokens: string[]
  url: string
  volumeUsd1d: number | null
  volumeUsd7d: number | null
}

export type HistoricalAPY = {
  // Define the HistoricalAPY type here based on expected data structure
  date: string
  apy: number
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
  const tokenIcons = tokens.slice(0, 3).map(() => "💎")

  return {
    id: pool.pool,
    name: `${pool.symbol} - ${pool.project}`,
    protocol: pool.project,
    chain: pool.chain,
    poolAddress: pool.poolAddress,
    currentApy: pool.apy || 0,
    apyMean30d: pool.apyMean30d || 0,
    dailyYield: (pool.apy || 0) / 365,
    tvl: formatTVL(pool.tvlUsd),
    tvlNumeric: pool.tvlUsd,
    category: pool.stablecoin ? "stablecoin" : "other",
    isStablecoin: pool.stablecoin,
    deposited: 0,
    tokenIcons,
    isNew: false,
    isBoosted: false,
    audits: protocol?.audits || "Unknown",
    listedAt: protocol?.listedAt,
    volume24h: pool.volumeUsd1d || 0,
    apyHistory: [],
    underlyingSymbols: tokens,
    rugged: false,
    safetyScore: pool.securityScore || 0,
    predictions: pool.predictions,
    url: pool.url,
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
    const response = await fetch("http://157.230.251.44:9000/scores?limit=10&tokens=SUSDS")
    if (!response.ok) throw new Error("Failed to fetch pools")

    console.log("[v0] Fetching pools from scores endpoint...")
    const result = await response.json()
    console.log("[v0] Scores endpoint response:", result)

    const pools = result.data || []

    console.log("[v0] Total pools received:", pools.length)

    return pools
  } catch (error) {
    console.error("[v0] Error fetching pools from scores endpoint:", error)
    return []
  }
}
