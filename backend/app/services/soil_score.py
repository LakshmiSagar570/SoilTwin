def calculate_soil_health_score(N: float, P: float, K: float,
                                  pH: float, moisture: float = 45,
                                  organic_carbon: float = 0.55) -> dict:
    score = 0
    warnings = []
    suggestions = []

    # Nitrogen (0-25 pts)
    n_score = min(N / 140 * 25, 25)
    score += n_score
    if N < 50:
        warnings.append("Severe nitrogen deficiency")
        suggestions.append("Apply Urea or organic compost immediately")
    elif N < 80:
        warnings.append("Moderate nitrogen deficiency")
        suggestions.append("Consider adding 40kg Urea per acre")

    # Phosphorus (0-20 pts)
    p_score = min(P / 145 * 20, 20)
    score += p_score
    if P < 15:
        warnings.append("Low phosphorus levels")
        suggestions.append("Apply DAP fertilizer to boost phosphorus")

    # Potassium (0-20 pts)
    k_score = min(K / 205 * 20, 20)
    score += k_score
    if K < 110:
        warnings.append("Potassium deficiency detected")
        suggestions.append("Apply MOP (Muriate of Potash)")

    # pH (0-20 pts)
    if 6.0 <= pH <= 7.5:
        ph_score = 20
    elif 5.5 <= pH < 6.0 or 7.5 < pH <= 8.0:
        ph_score = 12
        if pH < 6.0:
            warnings.append("Soil is slightly acidic")
            suggestions.append("Apply agricultural lime to raise pH")
        else:
            warnings.append("Soil is slightly alkaline")
            suggestions.append("Add organic matter to balance pH")
    else:
        ph_score = 5
        if pH < 5.5:
            warnings.append("Soil is highly acidic — urgent action needed")
            suggestions.append("Apply lime generously and test again after 2 weeks")
        else:
            warnings.append("Soil is highly alkaline — crop risk is high")
            suggestions.append("Use gypsum to reduce alkalinity")
    score += ph_score

    # Organic carbon (0-10 pts)
    oc_score = min(organic_carbon / 1.5 * 10, 10)
    score += oc_score
    if organic_carbon < 0.4:
        warnings.append("Very low organic carbon")
        suggestions.append("Add compost or green manure to improve soil health")

    # Moisture (0-5 pts)
    if 40 <= moisture <= 70:
        score += 5
    elif 30 <= moisture < 40 or 70 < moisture <= 80:
        score += 3
        if moisture < 40:
            warnings.append("Soil moisture is low")
            suggestions.append("Schedule irrigation soon")
    else:
        score += 1
        if moisture < 30:
            warnings.append("Critically low moisture — irrigation needed urgently")

    final_score = round(min(score, 100), 1)

    if final_score >= 75:
        status = "Healthy"
        status_color = "green"
    elif final_score >= 55:
        status = "Moderate"
        status_color = "yellow"
    else:
        status = "Poor"
        status_color = "red"

    return {
        "score": final_score,
        "status": status,
        "status_color": status_color,
        "warnings": warnings,
        "suggestions": suggestions,
        "breakdown": {
            "nitrogen_score": round(n_score, 1),
            "phosphorus_score": round(p_score, 1),
            "potassium_score": round(k_score, 1),
            "ph_score": ph_score,
            "organic_carbon_score": round(oc_score, 1)
        }
    }