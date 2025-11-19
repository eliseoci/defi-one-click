from flask import Flask, jsonify

app = Flask(__name__)

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


@app.route("/markets", methods=["GET"])
def markets():
    """
    Return mocked crypto protocol metrics.
    """
    return jsonify({"data": MOCK_MARKETS})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
