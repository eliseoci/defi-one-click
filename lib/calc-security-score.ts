export type SecurityMetrics = {
  // Protocol metrics
  hasAudits: boolean
  auditScore: number
  auditDetails: string

  // TVL metrics
  tvl: number
  tvlScore: number
  tvlRating: "High" | "Medium" | "Low"

  // Age metrics
  protocolAgeDays: number
  ageScore: number
  ageRating: "Established" | "Moderate" | "New"

  // Volume metrics
  volume24h: number
  volumeScore: number
  volumeRating: "High" | "Medium" | "Low"

  // APY volatility
  apyVolatility: number
  volatilityScore: number
  volatilityRating: "Stable" | "Moderate" | "Volatile"

  // Token assessment
  tokenScores: Array<{
    symbol: string
    score: number
    isStablecoin: boolean
    marketCapRating: string
  }>
  avgTokenScore: number

  // Overall
  totalScore: number
  rating: "Very High" | "High" | "Medium" | "Low" | "Very Low"
}

type PoolData = {
  audits: string
  rugged: boolean
  tvl: number
  listedAt?: number
  volume24h?: number
  apyHistory?: Array<{ apy: number; time: number }>
  underlyingSymbols?: Array<string>
}

export async function calcSecurityScoreWithMetrics(pool: PoolData): Promise<SecurityMetrics> {
  let auditScore = 0
  let hasAudits = false
  const auditDetails = pool.audits

  // Audit scoring
  if (pool.rugged) {
    auditScore = -40
  } else if (pool.audits.toLowerCase().includes("no")) {
    auditScore = -50
  } else if (pool.audits.toLowerCase().includes("audit")) {
    hasAudits = true
    const numAudits = Number.parseInt(pool.audits[0], 10) || 1
    if (numAudits >= 2) auditScore = 20
    else if (numAudits === 1) auditScore = 10
  } else {
    auditScore = -25
  }

  // TVL scoring
  let tvlScore = 0
  let tvlRating: "High" | "Medium" | "Low" = "Low"
  if (pool.tvl < 1_000_000) {
    tvlScore = -10
    tvlRating = "Low"
  } else if (pool.tvl > 100_000_000) {
    tvlScore = 15
    tvlRating = "High"
  } else if (pool.tvl > 10_000_000) {
    tvlScore = 10
    tvlRating = "Medium"
  }

  // Age scoring
  let ageScore = 0
  let protocolAgeDays = 0
  let ageRating: "Established" | "Moderate" | "New" = "New"
  if (pool.listedAt) {
    const now = Date.now() / 1000
    protocolAgeDays = Math.floor((now - pool.listedAt) / (24 * 3600))
    if (protocolAgeDays > 730) {
      ageScore = 10
      ageRating = "Established"
    } else if (protocolAgeDays > 365) {
      ageScore = 7
      ageRating = "Established"
    } else if (protocolAgeDays > 90) {
      ageScore = 3
      ageRating = "Moderate"
    } else {
      ageScore = -5
      ageRating = "New"
    }
  }

  // Volume scoring
  let volumeScore = 0
  let volumeRating: "High" | "Medium" | "Low" = "Low"
  const volume24h = pool.volume24h || 0
  if (volume24h > 50_000_000) {
    volumeScore = 10
    volumeRating = "High"
  } else if (volume24h > 10_000_000) {
    volumeScore = 5
    volumeRating = "Medium"
  } else if (volume24h > 0) {
    volumeScore = -5
    volumeRating = "Low"
  }

  // APY volatility scoring
  let volatilityScore = 0
  let apyVolatility = 0
  let volatilityRating: "Stable" | "Moderate" | "Volatile" = "Moderate"
  if (pool.apyHistory && pool.apyHistory.length >= 10) {
    const apys = pool.apyHistory.map((d) => d.apy)
    const avg = apys.reduce((a, b) => a + b, 0) / apys.length
    const variance = apys.reduce((a, b) => a + (b - avg) ** 2, 0) / apys.length
    const stdDev = Math.sqrt(variance)
    apyVolatility = avg > 0 ? stdDev / avg : 0

    if (stdDev > avg * 0.5) {
      volatilityScore = -5
      volatilityRating = "Volatile"
    } else if (stdDev < avg * 0.1) {
      volatilityScore = 5
      volatilityRating = "Stable"
    }
  }

  // Token assessment
  const tokenScores: Array<{
    symbol: string
    score: number
    isStablecoin: boolean
    marketCapRating: string
  }> = []
  let avgTokenScore = 0

  if (pool.underlyingSymbols && pool.underlyingSymbols.length > 0) {
    for (const symbol of pool.underlyingSymbols) {
      const tokenScore = await scoreToken(symbol)
      tokenScores.push(tokenScore)
      avgTokenScore += tokenScore.score
    }
    avgTokenScore = avgTokenScore / pool.underlyingSymbols.length
  } else {
    avgTokenScore = -10
  }

  // Calculate total score
  let totalScore = 100 + auditScore + tvlScore + ageScore + volumeScore + volatilityScore + avgTokenScore
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)))

  // Determine overall rating
  let rating: "Very High" | "High" | "Medium" | "Low" | "Very Low"
  if (totalScore >= 80) rating = "Very High"
  else if (totalScore >= 65) rating = "High"
  else if (totalScore >= 50) rating = "Medium"
  else if (totalScore >= 35) rating = "Low"
  else rating = "Very Low"

  return {
    hasAudits,
    auditScore,
    auditDetails,
    tvl: pool.tvl,
    tvlScore,
    tvlRating,
    protocolAgeDays,
    ageScore,
    ageRating,
    volume24h,
    volumeScore,
    volumeRating,
    apyVolatility,
    volatilityScore,
    volatilityRating,
    tokenScores,
    avgTokenScore,
    totalScore,
    rating,
  }
}

async function scoreToken(symbol: string): Promise<{
  symbol: string
  score: number
  isStablecoin: boolean
  marketCapRating: string
}> {
  const stablecoins = ["USDC", "DAI", "USDT", "TUSD", "PAX", "BUSD", "FRAXBP", "CRVUSD", "PYUSD", "MKUSD", "USDE"]
  const isStablecoin = stablecoins.includes(symbol.toUpperCase())

  let score = 0
  let marketCapRating = "Unknown"

  // Stablecoin bonus
  if (isStablecoin) {
    score += 10
    marketCapRating = "High (Stablecoin)"
  }

  // Note: Full token data would require additional API calls to CoinGecko or similar
  // For now, we're using simplified logic

  return {
    symbol,
    score,
    isStablecoin,
    marketCapRating,
  }
}

// Legacy function for backward compatibility
export async function calcSecurityScore(pool: PoolData): Promise<number> {
  const metrics = await calcSecurityScoreWithMetrics(pool)
  return metrics.totalScore
}

export type { PoolData }
