from app.services.soil_score import calculate_soil_health_score

CROP_DATA = {
    "rice":       {"N": 20, "P": 8,  "K": 15, "days": 135, "season": "Kharif"},
    "wheat":      {"N": 18, "P": 7,  "K": 12, "days": 160, "season": "Rabi"},
    "maize":      {"N": 22, "P": 10, "K": 18, "days": 95,  "season": "Kharif/Zaid"},
    "cotton":     {"N": 25, "P": 12, "K": 20, "days": 180, "season": "Kharif"},
    "groundnut":  {"N": 10, "P": 5,  "K": 8,  "days": 110, "season": "Kharif"},
    "sugarcane":  {"N": 28, "P": 14, "K": 22, "days": 330, "season": "Annual"},
    "soybean":    {"N": 12, "P": 6,  "K": 10, "days": 100, "season": "Kharif"},
    "sorghum":    {"N": 16, "P": 7,  "K": 13, "days": 110, "season": "Kharif/Rabi"},
}

RAINFALL_LEACHING = {
    "low":    {"N": 0.02, "P": 0.01, "K": 0.02},
    "medium": {"N": 0.05, "P": 0.02, "K": 0.04},
    "heavy":  {"N": 0.12, "P": 0.04, "K": 0.08},
}

FERTILIZER_RECOMMENDATIONS = {
    "rice":      {"urea_kg": 40, "dap_kg": 20, "mop_kg": 15},
    "wheat":     {"urea_kg": 35, "dap_kg": 18, "mop_kg": 12},
    "maize":     {"urea_kg": 45, "dap_kg": 22, "mop_kg": 18},
    "cotton":    {"urea_kg": 50, "dap_kg": 25, "mop_kg": 20},
    "groundnut": {"urea_kg": 20, "dap_kg": 10, "mop_kg": 8},
    "sugarcane": {"urea_kg": 55, "dap_kg": 28, "mop_kg": 22},
    "soybean":   {"urea_kg": 25, "dap_kg": 12, "mop_kg": 10},
    "sorghum":   {"urea_kg": 30, "dap_kg": 15, "mop_kg": 12},
}

def simulate_seasons(N: float, P: float, K: float, pH: float,
                     moisture: float, organic_carbon: float,
                     crop: str, rainfall_scenario: str,
                     seasons: int = 5,
                     apply_fertilizer: bool = False) -> list:

    timeline = []
    leach = RAINFALL_LEACHING.get(rainfall_scenario, RAINFALL_LEACHING["medium"])
    crop_info = CROP_DATA.get(crop.lower(), {"N": 15, "P": 7, "K": 12, "days": 120, "season": "Kharif"})
    fertilizer = FERTILIZER_RECOMMENDATIONS.get(crop.lower(), {})

    cumulative_days = 0

    for season in range(1, seasons + 1):
        if apply_fertilizer:
            N += fertilizer.get("urea_kg", 0) * 0.46
            P += fertilizer.get("dap_kg", 0) * 0.18
            K += fertilizer.get("mop_kg", 0) * 0.50

        N = max(0, N - crop_info["N"] - (N * leach["N"]))
        P = max(0, P - crop_info["P"] - (P * leach["P"]))
        K = max(0, K - crop_info["K"] - (K * leach["K"]))
        organic_carbon = max(0, organic_carbon - 0.03)
        cumulative_days += crop_info["days"]

        health = calculate_soil_health_score(N, P, K, pH, moisture, organic_carbon)

        # Convert days to human-readable time
        months = cumulative_days / 30
        if months < 12:
            time_label = f"{round(months, 1)} months"
        else:
            years = months / 12
            time_label = f"{round(years, 1)} years"

        timeline.append({
            "season": season,
            "N": round(N, 1),
            "P": round(P, 1),
            "K": round(K, 1),
            "pH": pH,
            "health_score": health["score"],
            "status": health["status"],
            "status_color": health["status_color"],
            "crop_days": crop_info["days"],        # ← how long this crop takes
            "cumulative_days": cumulative_days,    # ← total time elapsed
            "time_label": time_label,              # ← "8 months", "2.5 years"
            "crop_season": crop_info["season"],    # ← "Kharif", "Rabi"
        })

    return timeline
def get_fertilizer_recommendation(crop: str, soil_score: float) -> dict:
    base = FERTILIZER_RECOMMENDATIONS.get(crop.lower(), {
        "urea_kg": 35, "dap_kg": 18, "mop_kg": 12
    })
    if soil_score > 75:
        factor = 0.7
        note = "Soil is healthy — reduced fertilizer needed"
    elif soil_score > 55:
        factor = 1.0
        note = "Standard fertilizer application recommended"
    else:
        factor = 1.3
        note = "Soil is poor — increased fertilizer needed alongside organic compost"

    return {
        "urea_kg": round(base["urea_kg"] * factor),
        "dap_kg": round(base["dap_kg"] * factor),
        "mop_kg": round(base["mop_kg"] * factor),
        "note": note
    }