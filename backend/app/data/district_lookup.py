DISTRICT_SOIL_DATA = {
    ("telangana", "warangal"): {
        "soil_type": "Red Sandy Loam",
        "N": 65, "P": 22, "K": 180,
        "pH": 6.8, "organic_carbon": 0.52,
        "moisture": 40
    },
    ("telangana", "nizamabad"): {
        "soil_type": "Black Cotton Soil",
        "N": 80, "P": 30, "K": 210,
        "pH": 7.5, "organic_carbon": 0.68,
        "moisture": 50
    },
    ("telangana", "hyderabad"): {
        "soil_type": "Red Loam",
        "N": 60, "P": 18, "K": 160,
        "pH": 6.5, "organic_carbon": 0.45,
        "moisture": 38
    },
    ("telangana", "karimnagar"): {
        "soil_type": "Red Sandy Loam",
        "N": 70, "P": 25, "K": 190,
        "pH": 6.9, "organic_carbon": 0.55,
        "moisture": 42
    },
    ("andhra pradesh", "guntur"): {
        "soil_type": "Alluvial Soil",
        "N": 90, "P": 35, "K": 200,
        "pH": 7.2, "organic_carbon": 0.72,
        "moisture": 55
    },
    ("andhra pradesh", "krishna"): {
        "soil_type": "Alluvial Soil",
        "N": 95, "P": 38, "K": 215,
        "pH": 7.0, "organic_carbon": 0.78,
        "moisture": 58
    },
    ("andhra pradesh", "kurnool"): {
        "soil_type": "Red Loam",
        "N": 62, "P": 20, "K": 170,
        "pH": 6.6, "organic_carbon": 0.48,
        "moisture": 40
    },
    ("maharashtra", "pune"): {
        "soil_type": "Black Cotton Soil",
        "N": 75, "P": 28, "K": 195,
        "pH": 7.4, "organic_carbon": 0.65,
        "moisture": 48
    },
    ("maharashtra", "nashik"): {
        "soil_type": "Medium Black Soil",
        "N": 78, "P": 30, "K": 200,
        "pH": 7.3, "organic_carbon": 0.62,
        "moisture": 46
    },
    ("maharashtra", "nagpur"): {
        "soil_type": "Black Cotton Soil",
        "N": 82, "P": 32, "K": 205,
        "pH": 7.6, "organic_carbon": 0.70,
        "moisture": 50
    },
    ("punjab", "ludhiana"): {
        "soil_type": "Alluvial Soil",
        "N": 110, "P": 45, "K": 230,
        "pH": 7.8, "organic_carbon": 0.85,
        "moisture": 60
    },
    ("punjab", "amritsar"): {
        "soil_type": "Alluvial Soil",
        "N": 105, "P": 42, "K": 225,
        "pH": 7.7, "organic_carbon": 0.82,
        "moisture": 58
    },
    ("uttar pradesh", "lucknow"): {
        "soil_type": "Alluvial Soil",
        "N": 100, "P": 40, "K": 220,
        "pH": 7.5, "organic_carbon": 0.80,
        "moisture": 55
    },
    ("uttar pradesh", "varanasi"): {
        "soil_type": "Alluvial Soil",
        "N": 95, "P": 38, "K": 210,
        "pH": 7.4, "organic_carbon": 0.76,
        "moisture": 52
    },
    ("karnataka", "bangalore"): {
        "soil_type": "Red Sandy Loam",
        "N": 58, "P": 18, "K": 155,
        "pH": 6.2, "organic_carbon": 0.42,
        "moisture": 36
    },
    ("karnataka", "mysore"): {
        "soil_type": "Red Loam",
        "N": 62, "P": 20, "K": 165,
        "pH": 6.4, "organic_carbon": 0.46,
        "moisture": 38
    },
    ("rajasthan", "jaipur"): {
        "soil_type": "Sandy Arid Soil",
        "N": 40, "P": 12, "K": 140,
        "pH": 8.0, "organic_carbon": 0.28,
        "moisture": 22
    },
    ("rajasthan", "jodhpur"): {
        "soil_type": "Desert Sandy Soil",
        "N": 35, "P": 10, "K": 130,
        "pH": 8.2, "organic_carbon": 0.22,
        "moisture": 18
    },
    ("west bengal", "kolkata"): {
        "soil_type": "Alluvial Soil",
        "N": 98, "P": 40, "K": 218,
        "pH": 6.8, "organic_carbon": 0.82,
        "moisture": 65
    },
    ("gujarat", "ahmedabad"): {
        "soil_type": "Black Soil",
        "N": 72, "P": 26, "K": 185,
        "pH": 7.6, "organic_carbon": 0.58,
        "moisture": 44
    },
}

DEFAULT_SOIL = {
    "soil_type": "Loamy Soil",
    "N": 70, "P": 25, "K": 180,
    "pH": 7.0, "organic_carbon": 0.55,
    "moisture": 45
}

def get_soil_by_district(state: str, district: str) -> dict:
    key = (state.lower().strip(), district.lower().strip())
    data = DISTRICT_SOIL_DATA.get(key, DEFAULT_SOIL).copy()
    data["source"] = "regional_estimate"
    data["region"] = f"{district.title()}, {state.title()}"
    return data