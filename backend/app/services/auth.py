import os, uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.services.db import get_conn

SECRET     = os.getenv("JWT_SECRET", "change-me")
ALGORITHM  = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MINUTES", 10080))

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=[ALGORITHM])

def register_user(email: str, password: str) -> dict:
    with get_conn() as conn:
        with conn.cursor() as cur:
            # Check duplicate
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                raise ValueError("Email already registered")
            user_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO users (id, email, password_hash) VALUES (%s, %s, %s)",
                (user_id, email, hash_password(password))
            )
    return {"id": user_id, "email": email}

def login_user(email: str, password: str) -> dict:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
    if not row or not verify_password(password, row[1]):
        raise ValueError("Invalid email or password")
    token = create_token(str(row[0]), email)
    return {"token": token, "user_id": str(row[0]), "email": email}