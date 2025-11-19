type PoolData = {
  audits: string;             // "Yes", "No", "2 Audits", etc
  rugged: boolean;            // true if flagged as rugged/exploited
  tvl: number;                // in USD, using current TVL
  listedAt?: number;          // Unix timestamp when protocol listed
  volume24h?: number;         // Optional: trading/deposit volume, USD
  apyHistory?: Array<{apy:number, time:number}>; // optional volatility
};

function calcSecurityScore(pool: PoolData): number {
  let score = 100;
  
  // Rugged exploit excludes trust
  if (pool.rugged) score -= 40;

  // Audit factor - much stronger now
  if (pool.audits.toLowerCase().includes('no')) score -= 50;
  else if (pool.audits.toLowerCase().includes('audit')) {
    // Extract number of audits if present
    const numAudits = parseInt(pool.audits[0], 10);
    if (numAudits >= 2) score += 20;
    else if (numAudits === 1) score += 10;
    else score -= 10; // Unclear audit
  } else score -= 25; // No info = risky

  // TVL factor - no bonus points below $1M, penalize small
  if (pool.tvl < 1_000_000) score -= 10;
  else if (pool.tvl > 100_000_000) score += 15;
  else if (pool.tvl > 10_000_000) score += 10;
  // No points for 1M-10M

  // Protocol age (max 10)
  if (pool.listedAt) {
    const now = Date.now() / 1000;
    const ageDays = (now - pool.listedAt) / (24*3600);
    if (ageDays > 730) score += 10;
    else if (ageDays > 365) score += 7;
    else if (ageDays > 90) score += 3;
    else score -= 5;
  }
  
  // Volume = confidence (max 10)
  if (pool.volume24h) {
    if (pool.volume24h > 50_000_000) score += 10;
    else if (pool.volume24h > 10_000_000) score += 5;
    else score -= 5;
  }

  // APY volatility: stable pools safer (±5)
  if (pool.apyHistory && pool.apyHistory.length >= 10) {
    const apys = pool.apyHistory.map(d=>d.apy);
    const avg = apys.reduce((a,b)=>a+b,0) / apys.length;
    const variance = apys.reduce((a,b)=>a + (b-avg)**2,0) / apys.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > avg*0.5) score -= 5;
    else if (stdDev < avg*0.1) score += 5;
  }
  
  score = Math.max(0, Math.min(100, score));
  return Math.round(score);
}
