import httpx
from datetime import datetime

async def get_weather_forecast(lat: float, lng: float) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max",
        "forecast_days": 16,
        "timezone": "Asia/Kolkata"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()

    daily = data.get("daily", {})
    precipitation = daily.get("precipitation_sum", [])
    temps_max = daily.get("temperature_2m_max", [])
    temps_min = daily.get("temperature_2m_min", [])
    humidity = daily.get("relative_humidity_2m_max", [])

    total_rainfall = sum(p for p in precipitation if p is not None)
    avg_temp = sum(t for t in temps_max if t is not None) / max(len(temps_max), 1)
    avg_humidity = sum(h for h in humidity if h is not None) / max(len(humidity), 1)

    if total_rainfall > 100:
        rainfall_scenario = "heavy"
        season_label = "Heavy Monsoon Season"
    elif total_rainfall > 40:
        rainfall_scenario = "medium"
        season_label = "Moderate Rainfall Season"
    else:
        rainfall_scenario = "low"
        season_label = "Dry Season"

    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        crop_season = "Kharif"
    elif month in [10, 11, 12, 1, 2]:
        crop_season = "Rabi"
    else:
        crop_season = "Zaid"

    return {
        "total_rainfall_16d_mm": round(total_rainfall, 1),
        "avg_temperature_c": round(avg_temp, 1),
        "avg_humidity_pct": round(avg_humidity, 1),
        "rainfall_scenario": rainfall_scenario,
        "season_label": season_label,
        "crop_season": crop_season,
        "forecast_days": precipitation
    }