import os, psycopg2, psycopg2.extras
from contextlib import contextmanager
import json

DATABASE_URL = os.getenv("DATABASE_URL")

@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def save_analysis(user_id: str, input_data: dict, result: dict):
    if not DATABASE_URL:
        return
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analyses
                      (user_id, lat, lng, state, district, soil_type,
                       health_score, fertility_level, top_crop, seasons,
                       apply_fertilizer, source, result_json)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    user_id,
                    input_data.get("lat"), input_data.get("lng"),
                    input_data.get("state"), input_data.get("district"),
                    result["soil"]["soil_type"],
                    result["health"]["score"],
                    result["fertility"]["fertility_level"],
                    result["crops"][0]["crop"] if result["crops"] else None,
                    input_data.get("seasons", 5),
                    input_data.get("apply_fertilizer", False),
                    input_data.get("source", "regional_estimate"),
                    json.dumps(result)
                ))
    except Exception as e:
        print(f"DB save failed: {e}")

def get_user_analyses(user_id: str) -> list:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, created_at, state, district, soil_type,
                       health_score, fertility_level, top_crop, seasons
                FROM analyses
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 20
            """, (user_id,))
            return [dict(r) for r in cur.fetchall()]