from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.soil_score import calculate_soil_health_score
from app.services.weather import get_weather_forecast
from app.services.simulation import simulate_seasons, get_fertilizer_recommendation
from app.services.llm import get_farm_advisory
from app.data.district_lookup import get_soil_by_district
import joblib, os, numpy as np, json

router = APIRouter()

# ── Model paths ──────────────────────────────────────────────
BASE = os.path.join(os.path.dirname(__file__), "../models")

# Model 1 — Crop Recommendation
crop_model        = joblib.load(f"{BASE}/crop_model.pkl")        if os.path.exists(f"{BASE}/crop_model.pkl")        else None

# Model 2 — Soil Fertility
fertility_model   = joblib.load(f"{BASE}/fertility_model.pkl")   if os.path.exists(f"{BASE}/fertility_model.pkl")   else None
fertility_scaler  = joblib.load(f"{BASE}/fertility_scaler.pkl")  if os.path.exists(f"{BASE}/fertility_scaler.pkl")  else None

# Model 3 — Yield Prediction
yield_model       = joblib.load(f"{BASE}/yield_model.pkl")       if os.path.exists(f"{BASE}/yield_model.pkl")       else None
yield_encoder     = joblib.load(f"{BASE}/yield_crop_encoder.pkl")if os.path.exists(f"{BASE}/yield_crop_encoder.pkl")else None

# Yield crop list
yield_crop_list = []
if os.path.exists(f"{BASE}/yield_crop_list.json"):
    with open(f"{BASE}/yield_crop_list.json") as f:
        yield_crop_list = json.load(f)

# ── Crop name bridge ─────────────────────────────────────────
CROP_NAME_MAP = {
    "rice":         "Rice, paddy",
    "maize":        "Maize",
    "wheat":        "Wheat",
    "soybean":      "Soybeans",
    "soybeans":     "Soybeans",
    "sorghum":      "Sorghum",
    "potato":       "Potatoes",
    "potatoes":     "Potatoes",
    "cassava":      "Cassava",
    "yam":          "Yams",
    "yams":         "Yams",
    "sweetpotato":  "Sweet potatoes",
}

FERTILITY_LABELS = {
    0: "Less Fertile",
    1: "Fertile",
    2: "Highly Fertile"
}

# ── Input Schema ─────────────────────────────────────────────
class SoilInput(BaseModel):
    lat: float
    lng: float
    state: str
    district: str
    # Optional manual overrides
    N:               Optional[float] = None
    P:               Optional[float] = None
    K:               Optional[float] = None
    pH:              Optional[float] = None
    moisture:        Optional[float] = None
    organic_carbon:  Optional[float] = None
    # Extra fertility inputs (optional)
    EC:              Optional[float] = None
    S:               Optional[float] = None
    Zn:              Optional[float] = None
    Fe:              Optional[float] = None
    Cu:              Optional[float] = None
    Mn:              Optional[float] = None
    B:               Optional[float] = None
    # Simulation controls
    source:          Optional[str]   = "regional_estimate"
    crop:            Optional[str]   = "rice"
    seasons:         Optional[int]   = 5
    apply_fertilizer:Optional[bool]  = False


# ── Helper: Yield Prediction ─────────────────────────────────
def predict_yield(crop: str, rainfall_mm: float, avg_temp: float) -> dict:
    if not yield_model or not yield_encoder:
        return {"yield_hg_per_ha": None, "yield_label": "Model not loaded"}

    # Map simple crop name to FAO name
    fao_name = CROP_NAME_MAP.get(crop.lower())
    if not fao_name or fao_name not in yield_crop_list:
        return {
            "yield_hg_per_ha": None,
            "yield_label": "Yield data not available for this crop",
            "fao_crop": None
        }

    crop_encoded = yield_encoder.transform([fao_name])[0]

    # Pesticides: use regional average (150 tonnes) as default
    features = np.array([[crop_encoded, rainfall_mm, 150.0, avg_temp]])
    predicted_yield = float(yield_model.predict(features)[0])

    # Normalize to percentage of max expected yield for display
    # Max reasonable yield ~500000 hg/ha, show as relative score
    yield_pct = min(round((predicted_yield / 350000) * 100, 1), 100)

    return {
        "yield_hg_per_ha": round(predicted_yield),
        "yield_tonnes_per_ha": round(predicted_yield / 10000, 2),
        "yield_score_pct": yield_pct,
        "fao_crop": fao_name,
        "yield_label": (
            "Excellent yield expected" if yield_pct > 70 else
            "Good yield expected"      if yield_pct > 45 else
            "Moderate yield expected"  if yield_pct > 25 else
            "Low yield — consider soil improvement"
        )
    }


# ── Helper: Fertility Prediction ─────────────────────────────
def predict_fertility(N, P, K, pH, OC,
                      EC=0.55, S=13.0, Zn=0.27,
                      Fe=0.62, Cu=1.10, Mn=7.5, B=0.55,
                      health_score=None) -> dict:

    # The fertility dataset uses different N/K scales (N:138-323, K:338-718)
    # Our crop inputs are outside that distribution, so we use health score
    # as the primary signal with ML as a secondary check

    score = health_score or 50

    if score >= 75:
        pred = 2  # Highly Fertile
        proba = [0.05, 0.20, 0.75]
    elif score >= 55:
        pred = 1  # Fertile
        proba = [0.15, 0.72, 0.13]
    else:
        pred = 0  # Less Fertile
        proba = [0.70, 0.25, 0.05]

    # Refine using ML only when inputs are in training range
    if fertility_model and fertility_scaler:
        if 138 <= N <= 340 and 330 <= K <= 730 and 7.0 <= pH <= 8.0:
            try:
                features = np.array([[N, P, K, pH, EC, OC, S, Zn, Fe, Cu, Mn, B]])
                scaled = fertility_scaler.transform(features)
                ml_pred = int(fertility_model.predict(scaled)[0])
                ml_proba = fertility_model.predict_proba(scaled)[0]
                # Only trust ML if it agrees within one level of health score
                if abs(ml_pred - pred) <= 1:
                    pred = ml_pred
                    proba = ml_proba.tolist()
            except Exception:
                pass  # keep health-score-based prediction

    return {
        "fertility_level": FERTILITY_LABELS[pred],
        "fertility_score": pred,
        "confidence_pct": round(float(proba[pred]) * 100, 1),
        "probabilities": {
            "less_fertile":   round(float(proba[0]) * 100, 1),
            "fertile":        round(float(proba[1]) * 100, 1),
            "highly_fertile": round(float(proba[2]) * 100, 1),
        }
    }

# ── Routes ───────────────────────────────────────────────────
@router.get("/district-defaults")
def district_defaults(state: str, district: str):
    return get_soil_by_district(state, district)


@router.post("/analyze")
async def analyze_soil(input: SoilInput):

    # ── Step 1: Resolve soil values ──────────────────────────
    defaults = get_soil_by_district(input.state, input.district)
    N   = input.N              if input.N   is not None else defaults["N"]
    P   = input.P              if input.P   is not None else defaults["P"]
    K   = input.K              if input.K   is not None else defaults["K"]
    pH  = input.pH             if input.pH  is not None else defaults["pH"]
    moisture = input.moisture  if input.moisture is not None else defaults["moisture"]
    OC  = input.organic_carbon if input.organic_carbon is not None else defaults["organic_carbon"]

    MICRONUTRIENT_DEFAULTS = {
    "Alluvial Soil":     {"EC": 0.62, "S": 15.0, "Zn": 0.30, "Fe": 0.75, "Cu": 1.20, "Mn": 8.0,  "B": 0.60},
    "Black Cotton Soil": {"EC": 0.75, "S": 18.0, "Zn": 0.28, "Fe": 0.65, "Cu": 1.50, "Mn": 10.0, "B": 0.80},
    "Red Sandy Loam":    {"EC": 0.45, "S": 10.0, "Zn": 0.25, "Fe": 0.55, "Cu": 0.90, "Mn": 6.0,  "B": 0.40},
    "Red Loam":          {"EC": 0.48, "S": 11.0, "Zn": 0.26, "Fe": 0.58, "Cu": 1.00, "Mn": 6.5,  "B": 0.45},
    "Medium Black Soil": {"EC": 0.70, "S": 16.0, "Zn": 0.29, "Fe": 0.70, "Cu": 1.30, "Mn": 9.0,  "B": 0.70},
    "Sandy Arid Soil":   {"EC": 0.35, "S": 7.0,  "Zn": 0.20, "Fe": 0.35, "Cu": 0.60, "Mn": 4.0,  "B": 0.30},
    "Desert Sandy Soil": {"EC": 0.28, "S": 5.0,  "Zn": 0.18, "Fe": 0.30, "Cu": 0.50, "Mn": 3.0,  "B": 0.25},
    "Loamy Soil":        {"EC": 0.55, "S": 13.0, "Zn": 0.27, "Fe": 0.62, "Cu": 1.10, "Mn": 7.5,  "B": 0.55},
}

    DEFAULT_MICRO = {"EC": 0.55, "S": 13.0, "Zn": 0.27, "Fe": 0.62, "Cu": 1.10, "Mn": 7.5, "B": 0.55}
    soil_type = defaults.get("soil_type", "Loamy Soil")
    micro = MICRONUTRIENT_DEFAULTS.get(soil_type, DEFAULT_MICRO)

    EC = input.EC if input.EC is not None else micro["EC"]
    S  = input.S  if input.S  is not None else micro["S"]
    Zn = input.Zn if input.Zn is not None else micro["Zn"]
    Fe = input.Fe if input.Fe is not None else micro["Fe"]
    Cu = input.Cu if input.Cu is not None else micro["Cu"]
    Mn = input.Mn if input.Mn is not None else micro["Mn"]
    B  = input.B  if input.B  is not None else micro["B"]

    soil_data = {
        "N": N, "P": P, "K": K, "pH": pH,
        "moisture": moisture, "organic_carbon": OC,
        "soil_type": defaults["soil_type"],
        "region": defaults.get("region", f"{input.district}, {input.state}"),
        "source": input.source
    }

    # ── Step 2: Soil health score (formula) ──────────────────
    health = calculate_soil_health_score(N, P, K, pH, moisture, OC)

    # ── Step 3: Weather (Open-Meteo) ─────────────────────────
    try:
        weather = await get_weather_forecast(input.lat, input.lng)
    except Exception:
        weather = {
            "total_rainfall_16d_mm": 50.0,
            "avg_temperature_c": 28.0,
            "avg_humidity_pct": 65.0,
            "rainfall_scenario": "medium",
            "season_label": "Moderate Season",
            "crop_season": "Kharif",
            "forecast_days": []
        }

    # ── Step 4: Model 1 — Crop Recommendation ────────────────
    if crop_model:
        features_crop = np.array([[
            N, P, K,
            weather["avg_temperature_c"],
            weather["avg_humidity_pct"],
            pH,
            weather["total_rainfall_16d_mm"]
        ]])
        probs   = crop_model.predict_proba(features_crop)[0]
        top3idx = np.argsort(probs)[::-1][:3]
        crops   = [
            {
                "crop": crop_model.classes_[i],
                "confidence_pct": round(float(probs[i]) * 100, 1)
            }
            for i in top3idx
        ]
    else:
        crops = [
            {"crop": "rice",      "confidence_pct": 80.0},
            {"crop": "maize",     "confidence_pct": 12.0},
            {"crop": "groundnut", "confidence_pct": 8.0},
        ]

    # ── Step 5: Model 2 — Soil Fertility ─────────────────────
    fertility = predict_fertility(N, P, K, pH, OC, EC, S, Zn, Fe, Cu, Mn, B,
                              health_score=health["score"])

    # ── Step 6: Model 3 — Yield Prediction ───────────────────
    yield_data = predict_yield(
        input.crop,
        weather["total_rainfall_16d_mm"],
        weather["avg_temperature_c"]
    )

    # ── Step 7: Fertilizer recommendation ────────────────────
    fertilizer = get_fertilizer_recommendation(input.crop, health["score"])

    # ── Step 8: Season simulation ─────────────────────────────
    simulation = simulate_seasons(
        N, P, K, pH, moisture, OC,
        input.crop,
        weather["rainfall_scenario"],
        input.seasons,
        input.apply_fertilizer
    )

    # ── Step 9: LLM Advisory ─────────────────────────────────
    advisory = await get_farm_advisory({
        "soil":       soil_data,
        "health":     health,
        "weather":    weather,
        "crops":      [c["crop"] for c in crops],
        "fertility":  fertility,
        "yield_data": yield_data,
        "simulation": simulation,
        "fertilizer": fertilizer
    })

    # ── Final response ────────────────────────────────────────
    return {
        "soil":       soil_data,
        "health":     health,
        "fertility":  fertility,
        "weather":    weather,
        "crops":      crops,
        "yield":      yield_data,
        "fertilizer": fertilizer,
        "simulation": simulation,
        "advisory":   advisory
    }
from app.services.db import save_analysis

@router.post("/analyze")
async def analyze_soil(input: SoilInput, request: Request):
    user_id = request.headers.get("X-User-Id")
    
    # ... all your existing code ...
    
    response_data = {
        "soil": soil_data, "health": health, "fertility": fertility,
        "weather": weather, "crops": crops, "yield": yield_data,
        "fertilizer": fertilizer, "simulation": simulation, "advisory": advisory
    }

    # Save to DB
    if user_id:
        save_analysis(user_id, input.dict(), response_data)

    return response_data