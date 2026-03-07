import os
from pathlib import Path
from tkinter.filedialog import Open
from dotenv import load_dotenv

# Force load .env from backend root regardless of where uvicorn is run from
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

# print(f"[LLM] Loading .env from: {env_path}")
# print(f"[LLM] Provider: {os.getenv('LLM_PROVIDER')}")
# print(f"[LLM] Key set: {bool(os.getenv('GROQ_API_KEY'))}")



import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def build_prompt(data: dict) -> str:
    soil = data["soil"]
    health = data["health"]
    weather = data["weather"]
    crops = data["crops"]
    simulation = data["simulation"]
    fertilizer = data["fertilizer"]

    return f"""You are an expert agricultural advisor for Indian farmers.
Based on the following soil analysis data, write a clear and friendly 3-paragraph farm advisory report.
Use simple English that a farmer can understand. Be specific and actionable.

SOIL DATA:
- Location: {soil.get('region', 'Unknown region')}
- Soil Type: {soil.get('soil_type', 'Unknown')}
- Nitrogen: {soil.get('N')} | Phosphorus: {soil.get('P')} | Potassium: {soil.get('K')}
- pH: {soil.get('pH')} | Moisture: {soil.get('moisture')}%

SOIL HEALTH:
- Score: {health['score']}/100 ({health['status']})
- Warnings: {', '.join(health['warnings']) if health['warnings'] else 'None'}

WEATHER & SEASON:
- Season: {weather['crop_season']} ({weather['season_label']})
- Avg Temperature: {weather['avg_temperature_c']}°C
- Expected Rainfall (16 days): {weather['total_rainfall_16d_mm']}mm
- Humidity: {weather['avg_humidity_pct']}%

CROP RECOMMENDATION:
- Best crops for this soil: {', '.join(crops[:3]) if crops else 'Not available'}

FERTILIZER PLAN:
- Urea: {fertilizer.get('urea_kg')}kg | DAP: {fertilizer.get('dap_kg')}kg | MOP: {fertilizer.get('mop_kg')}kg
- Note: {fertilizer.get('note')}

FUTURE SOIL SIMULATION (without fertilizer):
- Season 1 health: {simulation[0]['health_score'] if len(simulation) > 0 else 'N/A'}
- Season 3 health: {simulation[2]['health_score'] if len(simulation) > 2 else 'N/A'}
- Season 5 health: {simulation[4]['health_score'] if len(simulation) > 4 else 'N/A'}

Write exactly 3 short paragraphs:
1. Current soil condition and what it means for the farmer
2. What to plant this season and why, given the weather
3. What will happen in future seasons and what to do now to protect soil health
Do not use bullet points. Write naturally and warmly."""


async def get_farm_advisory(data: dict) -> str:
    if not client:
        return _fallback_advisory(data)

    try:
        prompt = build_prompt(data)

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a warm, knowledgeable agricultural advisor helping Indian farmers make better decisions. Always respond in simple, clear English."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=500,
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"Groq LLM error: {e}")
        return _fallback_advisory(data)


def _fallback_advisory(data: dict) -> str:
    health = data["health"]
    crops = data["crops"]
    score = health["score"]
    top_crop = crops[0] if crops else "a suitable crop"

    return (
        f"Your soil is currently in {health['status'].lower()} condition "
        f"with a health score of {score}/100. "
        f"{'There are some nutrient deficiencies that need attention before planting.' if score < 70 else 'Your soil is in good shape for the upcoming season.'} "
        f"Based on your soil profile and current weather, {top_crop} is the most suitable crop this season. "
        f"Following the fertilizer plan provided will help maximize your yield. "
        f"Apply organic compost regularly to maintain long-term soil fertility."
    )