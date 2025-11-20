type PoolData = {
  audits: string
  rugged: boolean
  tvl: number
  listedAt?: number
  volume24h?: number
  apyHistory?: Array<{ apy: number; time: number }>
  underlyingSymbols?: Array<string> // Token symbols for assessment
}

// Fetch token data from DefiLlama API
async function getTokenData(symbol: string) {
  try {
    // Get asset details
    const assets = await fetch("https://api.llama.fi/api/chainAssets").then((res) => res.json())
    const assetInfo = Object.values(assets)
      .flat()
      .find((t: any) => t.symbol.toUpperCase() === symbol.toUpperCase())

    // Get protocol usage
    const protocolData = await fetch(`https://api.llama.fi/api/tokenProtocols/${symbol}`).then((res) => res.json())

    // Get unlocks
    const unlocks = await fetch("https://api.llama.fi/unlock").then((res) => res.json())
    const unlockEvent = unlocks.find((u: any) => u.symbol.toUpperCase() === symbol.toUpperCase())

    // Check if stablecoin and get depeg data
    const stablecoins = ["USDC", "DAI", "USDT", "TUSD", "PAX", "BUSD", "FRAXBP", "CRVUSD", "PYUSD", "MKUSD", "USDE"]
    const isStable = stablecoins.includes(symbol.toUpperCase())
    let stableDepeg = 0
    if (isStable) {
      const stable = await fetch(`https://api.llama.fi/stablecoin/${symbol}`).then((res) => res.json())
      if (stable && stable.hasRecentDepegs) stableDepeg = 1
    }

    return { assetInfo, protocolData, unlockEvent, isStable, stableDepeg }
  } catch (error) {
    console.error(`[v0] Error fetching token data for ${symbol}:`, error)
    return { assetInfo: null, protocolData: null, unlockEvent: null, isStable: false, stableDepeg: 0 }
  }
}

// Calculate token-level security score
async function scoreToken(symbol: string): Promise<number> {
  const { assetInfo, protocolData, unlockEvent, isStable, stableDepeg } = await getTokenData(symbol)
  let score = 0

  // Market Cap scoring
  if (assetInfo?.mc && assetInfo.mc > 1_000_000_000) score += 10
  else if (assetInfo?.mc && assetInfo.mc > 100_000_000) score += 5
  else if (assetInfo) score -= 7

  // Stablecoin bonus
  if (isStable) score += 10

  // Depeg penalty
  if (stableDepeg) score -= 15

  // Usage: protocol total TVL
  if (protocolData?.totalTVLUSD > 500_000_000) score += 8
  else if (protocolData && protocolData.totalTVLUSD > 50_000_000) score += 4

  // Unlock events penalty
  if (unlockEvent?.usdAmount > 100_000_000) score -= 15
  else if (unlockEvent?.usdAmount > 10_000_000) score -= 7

  return score
}

// Main security score calculation with token assessment
async function calcSecurityScore(pool: PoolData): Promise<number> {
  let score = 100

  // Rugged exploit excludes trust
  if (pool.rugged) score -= 40

  // Audit factor - much stronger now
  if (pool.audits.toLowerCase().includes("no")) score -= 50
  else if (pool.audits.toLowerCase().includes("audit")) {
    const numAudits = Number.parseInt(pool.audits[0], 10)
    if (numAudits >= 2) score += 20
    else if (numAudits === 1) score += 10
    else score -= 10
  } else score -= 25

  // TVL factor
  if (pool.tvl < 1_000_000) score -= 10
  else if (pool.tvl > 100_000_000) score += 15
  else if (pool.tvl > 10_000_000) score += 10

  // Protocol age
  if (pool.listedAt) {
    const now = Date.now() / 1000
    const ageDays = (now - pool.listedAt) / (24 * 3600)
    if (ageDays > 730) score += 10
    else if (ageDays > 365) score += 7
    else if (ageDays > 90) score += 3
    else score -= 5
  }

  // Volume
  if (pool.volume24h) {
    if (pool.volume24h > 50_000_000) score += 10
    else if (pool.volume24h > 10_000_000) score += 5
    else score -= 5
  }

  // APY volatility
  if (pool.apyHistory && pool.apyHistory.length >= 10) {
    const apys = pool.apyHistory.map((d) => d.apy)
    const avg = apys.reduce((a, b) => a + b, 0) / apys.length
    const variance = apys.reduce((a, b) => a + (b - avg) ** 2, 0) / apys.length
    const stdDev = Math.sqrt(variance)
    if (stdDev > avg * 0.5) score -= 5
    else if (stdDev < avg * 0.1) score += 5
  }

  if (pool.underlyingSymbols && pool.underlyingSymbols.length > 0) {
    let tokenScoreSum = 0
    for (const symbol of pool.underlyingSymbols) {
      tokenScoreSum += await scoreToken(symbol)
    }
    const avgTokenScore = tokenScoreSum / pool.underlyingSymbols.length
    score += avgTokenScore
  } else {
    score -= 10
  }

  score = Math.max(0, Math.min(100, score))
  return Math.round(score)
}

export { calcSecurityScore, type PoolData }
