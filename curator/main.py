from flask import Flask, jsonify, request, Response
import requests
from typing import List, Dict, Optional
import math
import re
from datetime import datetime, timezone

app = Flask(__name__)

VERSION = "0.2.0"
POOLS_API_KEY = os.getenv("POOLS_API_KEY")
POOLS_ENDPOINT = f"https://pro-api.llama.fi/{POOLS_API_KEY}/yields/poolsOld"
# Keep mock data for testing/debugging purposes
MOCK_MARKETS = [
    {
        "id": "2269",
        "name": "Aave",
        "symbol": "AAVE",
        "category": "Lending",
        "chains": ["Ethereum", "Polygon"],
        "tvl": 5_200_000_000,
        "chainTvls": {
            "Ethereum": 3_200_000_000,
            "Polygon": 2_000_000_000,
        },
        "change_1d": 2.1,
        "change_7d": -5.3,
    },
    {
        "id": "3155",
        "name": "Uniswap",
        "symbol": "UNI",
        "category": "DEX",
        "chains": ["Ethereum", "Arbitrum", "Base"],
        "tvl": 4_100_000_000,
        "chainTvls": {
            "Ethereum": 3_000_000_000,
            "Arbitrum": 800_000_000,
            "Base": 300_000_000,
        },
        "change_1d": -0.8,
        "change_7d": 4.6,
    },
    {
        "id": "1671",
        "name": "MakerDAO",
        "symbol": "MKR",
        "category": "CDP",
        "chains": ["Ethereum"],
        "tvl": 7_400_000_000,
        "chainTvls": {
            "Ethereum": 7_400_000_000,
        },
        "change_1d": 1.4,
        "change_7d": 3.2,
    },
]

DEFILLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols"


def fetch_defillama_protocols() -> List[Dict]:
    """
    Fetch protocols data from DefiLlama API and transform to our format.
    """
    print("\n[STEP 1] Starting to fetch protocols data from DefiLlama...")
    try:
        response = requests.get(DEFILLAMA_PROTOCOLS_URL, timeout=10)
        response.raise_for_status()
        protocols = response.json()
        print(f"[STEP 1] Received {len(protocols)} protocols from API")
        
        # Transform API response to match our data structure
        transformed_protocols = []
        for protocol in protocols:
            # Filter out protocols with null TVL or invalid data
            if protocol.get("tvl") is None:
                continue
                
            # Filter out chainTvls entries that end with "-borrowed" or are not relevant
            chain_tvls = {}
            if protocol.get("chainTvls"):
                for chain, tvl in protocol["chainTvls"].items():
                    # Skip borrowed amounts and other non-standard entries
                    if not chain.endswith("-borrowed") and tvl is not None and tvl > 0:
                        chain_tvls[chain] = tvl
            
            transformed_protocol = {
                "id": str(protocol.get("id", "")),
                "name": protocol.get("name", ""),
                "symbol": protocol.get("symbol", "-"),
                "category": protocol.get("category", ""),
                "chains": protocol.get("chains", []),
                "tvl": protocol.get("tvl", 0),
                "chainTvls": chain_tvls,
                "change_1d": protocol.get("change_1d"),
                "change_7d": protocol.get("change_7d"),
            }
            transformed_protocols.append(transformed_protocol)
        
        print(f"[STEP 1] ✓ Completed: Transformed {len(transformed_protocols)} valid protocols")
        return transformed_protocols
    except requests.exceptions.RequestException as e:
        # Log error and return empty list or fallback to mock data
        print(f"[STEP 1] ✗ Error fetching DefiLlama protocols data: {e}")
        return []


def fetch_defillama_pools() -> List[Dict]:
    """
    Fetch pools data from DefiLlama pro API.
    """
    print("\n[STEP 2] Starting to fetch pools data from DefiLlama pro API...")
    try:
        response = requests.get(POOLS_ENDPOINT, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "success" and "data" in data:
            pools = data["data"]
            print(f"[STEP 2] ✓ Completed: Received {len(pools)} pools from API")
            return pools
        print("[STEP 2] ✗ Warning: API response status was not 'success'")
        return []
    except requests.exceptions.RequestException as e:
        print(f"[STEP 2] ✗ Error fetching DefiLlama pools data: {e}")
        return []


def calculate_pool_security_score(pool: Dict, protocol: Optional[Dict]) -> float:
    """
    Calculate a security score (0-10) for a pool based on the pool metrics and
    the underlying protocol fundamentals (from the protocols endpoint).
    Higher score = more secure.
    """
    score = 0.0
    max_score = 10.0
    
    # 1. Pool TVL Score (0-3 points) - larger pools tend to be safer
    pool_tvl = pool.get("tvlUsd") or 0
    if pool_tvl > 0:
        pool_tvl_millions = pool_tvl / 1_000_000
        tvl_score = min(3.0, 0.5 + math.log10(max(1, pool_tvl_millions)))
        score += tvl_score
    
    # 2. Protocol Strength Score (0-3 points) - based on protocol TVL & momentum
    if protocol:
        protocol_tvl = protocol.get("tvl", 0)
        if protocol_tvl > 0:
            protocol_tvl_billions = protocol_tvl / 1_000_000_000
            protocol_tvl_score = min(2.0, 0.5 + math.log10(max(1, protocol_tvl_billions)))
            score += protocol_tvl_score
        
        change_1d = protocol.get("change_1d")
        change_7d = protocol.get("change_7d")
        
        if change_1d is not None:
            if change_1d >= 0:
                score += 0.4
            elif change_1d < -10:
                score -= 0.4
        
        if change_7d is not None:
            if change_7d >= 0:
                score += 0.6
            elif change_7d < -20:
                score -= 0.6
        
        chain_count = len(protocol.get("chains", []))
        if chain_count > 1:
            score += min(0.5, chain_count * 0.1)
    
    # 3. Pool Risk Flags (0-2 points)
    if pool.get("stablecoin", False):
        score += 0.3
    
    il_risk = pool.get("ilRisk")
    if il_risk == "no":
        score += 0.5
    elif il_risk == "yes":
        score -= 0.5
    
    exposure = pool.get("exposure")
    if exposure == "single":
        score += 0.2
    elif exposure == "multi":
        score -= 0.1
    
    # 4. Predictions & Confidence (0-1.5 points)
    predictions = pool.get("predictions", {})
    predicted_class = predictions.get("predictedClass")
    confidence = predictions.get("binnedConfidence")
    
    if predicted_class in ["Stable", "Stable/Up"]:
        if confidence == 3:
            score += 1.0
        elif confidence == 2:
            score += 0.7
        elif confidence == 1:
            score += 0.4
    elif predicted_class == "Down":
        score -= 0.7
    
    # 5. APY sanity checks (0-0.5 points)
    apy = pool.get("apy")
    if apy is not None:
        if 0 <= apy <= 20:
            score += 0.3
        elif apy > 50:
            score -= 0.3  # extremely high APY suggests higher risk
    
    # Normalize to 0-10 range
    score = max(0.0, min(max_score, score))
    
    return round(score, 2)


@app.route("/markets", methods=["GET"])
def markets():
    """
    Return crypto protocol metrics from DefiLlama API.
    Falls back to mock data if API request fails.
    """
    protocols = fetch_defillama_protocols()
    
    # Fallback to mock data if API fetch fails
    if not protocols:
        return jsonify({"data": MOCK_MARKETS, "source": "mock"})
    
    return jsonify({"data": protocols, "source": "defillama"})


@app.route("/scores", methods=["GET"])
def scores():
    """
    Return pools with security scores (0-10) calculated by combining
    DefiLlama pools data with their parent protocol fundamentals.
    Fetches fresh data from both APIs on each request.
    """
    print("\n" + "="*60)
    print("🔍 /scores endpoint called - Starting pool security score calculation")
    print("="*60)
    
    # Fetch data from both APIs
    protocols = fetch_defillama_protocols()
    pools = fetch_defillama_pools()
    
    if not protocols:
        print("\n[ERROR] Failed to fetch protocols data - aborting score calculation")
        return jsonify({
            "error": "Failed to fetch protocols data",
            "data": []
        }), 500
    
    if not pools:
        print("\n[ERROR] Failed to fetch pools data - aborting score calculation")
        return jsonify({
            "error": "Failed to fetch pools data",
            "data": []
        }), 500
    
    limit_param = request.args.get("limit")
    tokens_param = request.args.get("tokens")
    pools_limit: Optional[int] = None
    token_filters: List[str] = []

    if limit_param is not None:
        try:
            pools_limit = int(limit_param)
            if pools_limit <= 0:
                print(f"[STEP 3] Warning: limit must be positive. Received {pools_limit}. Defaulting to all pools.")
                pools_limit = None
        except ValueError:
            print(f"[STEP 3] Warning: invalid limit '{limit_param}'. Defaulting to all pools.")
            pools_limit = None

    if tokens_param:
        token_filters = [
            token.strip().lower()
            for token in tokens_param.split(",")
            if token.strip()
        ]
        if token_filters:
            print(f"[STEP 2.5] Token filter enabled: {token_filters}")

    protocols_by_name = {protocol.get("name", "").lower(): protocol for protocol in protocols if protocol.get("name")}

    def pool_matches_tokens(pool: Dict, filters: List[str]) -> bool:
        if not filters:
            return True

        symbol = (pool.get("symbol") or "").lower()
        symbol_parts = [part for part in re.split(r"[-_/ ]+", symbol) if part]
        underlying_tokens = [token.lower() for token in (pool.get("underlyingTokens") or [])]

        tokens_present = set(symbol_parts + underlying_tokens)
        if not tokens_present and symbol:
            tokens_present.add(symbol)

        for token_filter in filters:
            if token_filter not in tokens_present:
                return False
        return True

    if token_filters:
        original_pool_count = len(pools)
        pools = [pool for pool in pools if pool_matches_tokens(pool, token_filters)]
        print(f"[STEP 2.5] Filtered pools by tokens: {original_pool_count} -> {len(pools)}")
    
    def build_response(pools_payload: List[Dict]) -> Response:
        protocols_in_payload = {
            (pool.get("protocolMeta") or {}).get("id") or pool.get("project")
            for pool in pools_payload
            if (pool.get("protocolMeta") or {}).get("id") or pool.get("project")
        }
        return jsonify({
            "data": pools_payload,
            "source": "defillama",
            "poolsCount": len(pools_payload),
            "protocolsCount": len(protocols_in_payload),
            "limitApplied": pools_limit if pools_limit is not None else "all",
            "tokensFilter": token_filters if token_filters else "all",
            "version": VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    # Calculate security score for each pool
    print(f"\n[STEP 3] Starting to calculate security scores for {len(pools)} pools...")
    pools_with_scores = []
    total_pools = len(pools)
    
    for idx, pool in enumerate(pools, 1):
        project_name = pool.get("project", "").lower()
        protocol = protocols_by_name.get(project_name)
        
        security_score = calculate_pool_security_score(pool, protocol)
        
        pool_with_score = dict(pool)
        pool_with_score["securityScore"] = security_score
        pool_with_score["poolAddress"] = pool.get("pool_old") or pool.get("pool")
        
        if protocol:
            pool_with_score["protocolMeta"] = {
                "id": protocol.get("id"),
                "name": protocol.get("name"),
                "symbol": protocol.get("symbol"),
                "tvl": protocol.get("tvl"),
                "chains": protocol.get("chains", []),
                "change_1d": protocol.get("change_1d"),
                "change_7d": protocol.get("change_7d"),
            }
        else:
            pool_with_score["protocolMeta"] = None
        
        pools_with_scores.append(pool_with_score)
        
        # Show progress every 100 pools or for the last one
        if idx % 100 == 0 or idx == total_pools:
            print(f"[STEP 3] Progress: Calculated scores for {idx}/{total_pools} pools...")
    
    if not pools_with_scores:
        print("[STEP 3] No pools remaining after filters. Returning empty response.")
        return build_response([])
    
    # Sort by security score (highest first)
    print("[STEP 3] Sorting pools by security score...")
    pools_with_scores.sort(key=lambda x: x.get("securityScore", 0), reverse=True)
    
    highest_score = pools_with_scores[0]
    lowest_score = pools_with_scores[-1]
    protocols_matched = len({
        (pool.get("protocolMeta") or {}).get("id") or pool.get("project")
        for pool in pools_with_scores
        if (pool.get("protocolMeta") or {}).get("id") or pool.get("project")
    })
    
    print(f"[STEP 3] ✓ Completed: Calculated security scores for {len(pools_with_scores)} pools")
    print("\n📊 Results Summary:")
    print(f"   - Total pools: {len(pools_with_scores)}")
    print(f"   - Total protocols matched: {protocols_matched}")
    tokens_summary = ", ".join(token_filters) if token_filters else "none"
    print(f"   - Token filter: {tokens_summary}")
    print(f"   - Highest pool score: {highest_score.get('securityScore', 0):.2f} ({highest_score.get('project', 'N/A')} - {highest_score.get('symbol', 'N/A')})")
    print(f"   - Lowest pool score: {lowest_score.get('securityScore', 0):.2f} ({lowest_score.get('project', 'N/A')} - {lowest_score.get('symbol', 'N/A')})")
    print("="*60 + "\n")
    
    response_pools = pools_with_scores[:pools_limit] if pools_limit is not None else pools_with_scores
    if pools_limit is not None:
        print(f"[STEP 3] Returning top {len(response_pools)} pools (limit={pools_limit})")
    
    return build_response(response_pools)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
