from flask import Flask, jsonify
import requests
from typing import List, Dict

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

DEFILLAMA_API_URL = "https://api.llama.fi/protocols"


def fetch_defillama_protocols() -> List[Dict]:
    """
    Fetch protocols data from DefiLlama API and transform to our format.
    """
    try:
        response = requests.get(DEFILLAMA_API_URL, timeout=10)
        response.raise_for_status()
        protocols = response.json()
        
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
        
        return transformed_protocols
    except requests.exceptions.RequestException as e:
        # Log error and return empty list or fallback to mock data
        print(f"Error fetching DefiLlama data: {e}")
        return []


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
