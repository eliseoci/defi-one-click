from flask import Flask, jsonify
import requests
from typing import List, Dict
import math

app = Flask(__name__)

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
DEFILLAMA_POOLS_URL = "https://yields.llama.fi/pools"


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
    Fetch pools data from DefiLlama yields API.
    """
    print("\n[STEP 2] Starting to fetch pools data from DefiLlama yields API...")
    try:
        response = requests.get(DEFILLAMA_POOLS_URL, timeout=10)
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


def calculate_security_score(protocol: Dict, pools: List[Dict]) -> float:
    """
    Calculate a security score (0-10) for a protocol based on protocol and pool data.
    Higher score = more secure.
    """
    score = 0.0
    max_score = 10.0
    
    # Get pools for this protocol (match by project name)
    protocol_pools = [
        pool for pool in pools 
        if pool.get("project", "").lower() == protocol.get("name", "").lower()
    ]
    
    # 1. TVL Score (0-3 points)
    # Higher TVL = more secure (logarithmic scale)
    tvl = protocol.get("tvl", 0)
    if tvl > 0:
        # Log scale: 1B = 1.5, 10B = 2.5, 100B = 3.0
        tvl_score = min(3.0, 1.0 + (math.log10(max(1, tvl / 1_000_000)) / 2))
        score += tvl_score
    
    # 2. TVL Stability Score (0-1.5 points)
    # Positive or stable TVL changes = good
    change_1d = protocol.get("change_1d")
    change_7d = protocol.get("change_7d")
    
    if change_1d is not None:
        # Reward positive changes, penalize large negative changes
        if change_1d >= 0:
            score += 0.5
        elif change_1d < -10:  # Large drop
            score -= 0.5
    
    if change_7d is not None:
        if change_7d >= 0:
            score += 1.0
        elif change_7d < -20:  # Large weekly drop
            score -= 1.0
    
    # Clamp TVL stability score
    score = max(0, min(max_score, score))
    
    # 3. Pool Count & Diversity Score (0-2 points)
    # More pools = more established and diversified
    pool_count = len(protocol_pools)
    if pool_count > 0:
        # Log scale: 1 pool = 0.5, 10 pools = 1.5, 50+ pools = 2.0
        pool_score = min(2.0, 0.5 + (math.log10(max(1, pool_count)) * 0.5))
        score += pool_score
    
    # 4. Chain Diversity Score (0-1 point)
    # More chains = less single point of failure
    chain_count = len(protocol.get("chains", []))
    if chain_count > 1:
        score += min(1.0, chain_count * 0.25)
    
    # 5. Pool Quality Score (0-2.5 points)
    # Based on pool predictions, IL risk, and exposure
    if protocol_pools:
        total_pool_tvl = sum(pool.get("tvlUsd", 0) or 0 for pool in protocol_pools)
        if total_pool_tvl > 0:
            weighted_score = 0.0
            
            for pool in protocol_pools:
                pool_tvl = pool.get("tvlUsd", 0) or 0
                weight = pool_tvl / total_pool_tvl if total_pool_tvl > 0 else 0
                
                pool_score = 0.0
                
                # Predictions confidence
                predictions = pool.get("predictions", {})
                if predictions:
                    predicted_class = predictions.get("predictedClass", "")
                    confidence = predictions.get("binnedConfidence")
                    
                    if predicted_class in ["Stable", "Stable/Up"]:
                        if confidence == 3:
                            pool_score += 0.8
                        elif confidence == 2:
                            pool_score += 0.5
                        elif confidence == 1:
                            pool_score += 0.3
                    elif predicted_class == "Down":
                        pool_score -= 0.5
                
                # IL Risk (impermanent loss)
                il_risk = pool.get("ilRisk", "")
                if il_risk == "no":
                    pool_score += 0.5
                elif il_risk == "yes":
                    pool_score -= 0.3
                
                # Exposure type
                exposure = pool.get("exposure", "")
                if exposure == "single":
                    pool_score += 0.2  # Single exposure is generally safer
                
                # Stablecoin pools are generally safer
                if pool.get("stablecoin", False):
                    pool_score += 0.2
                
                weighted_score += pool_score * weight
            
            score += min(2.5, weighted_score)
    
    # Normalize to 0-10 range
    score = max(0.0, min(10.0, score))
    
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
    Return protocols with security scores (0-10) calculated from both
    protocols and pools data from DefiLlama APIs.
    Fetches fresh data from both APIs on each request.
    """
    print("\n" + "="*60)
    print("🔍 /scores endpoint called - Starting security score calculation")
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
    
    # Calculate security score for each protocol
    print(f"\n[STEP 3] Starting to calculate security scores for {len(protocols)} protocols...")
    protocols_with_scores = []
    total_protocols = len(protocols)
    
    for idx, protocol in enumerate(protocols, 1):
        security_score = calculate_security_score(protocol, pools)
        
        protocol_with_score = protocol.copy()
        protocol_with_score["securityScore"] = security_score
        protocols_with_scores.append(protocol_with_score)
        
        # Show progress every 50 protocols or for the last one
        if idx % 50 == 0 or idx == total_protocols:
            print(f"[STEP 3] Progress: Calculated scores for {idx}/{total_protocols} protocols...")
    
    # Sort by security score (highest first)
    print("[STEP 3] Sorting protocols by security score...")
    protocols_with_scores.sort(key=lambda x: x.get("securityScore", 0), reverse=True)
    
    print(f"[STEP 3] ✓ Completed: Calculated security scores for {len(protocols_with_scores)} protocols")
    print("\n📊 Results Summary:")
    print(f"   - Total protocols: {len(protocols_with_scores)}")
    print(f"   - Total pools: {len(pools)}")
    print(f"   - Highest security score: {protocols_with_scores[0].get('securityScore', 0):.2f} ({protocols_with_scores[0].get('name', 'N/A')})")
    print(f"   - Lowest security score: {protocols_with_scores[-1].get('securityScore', 0):.2f} ({protocols_with_scores[-1].get('name', 'N/A')})")
    print("="*60 + "\n")
    
    return jsonify({
        "data": protocols_with_scores,
        "source": "defillama",
        "poolsCount": len(pools),
        "protocolsCount": len(protocols_with_scores)
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
