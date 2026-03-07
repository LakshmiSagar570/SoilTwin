from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth import register_user, login_user

router = APIRouter()

class AuthInput(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(body: AuthInput):
    try:
        user = register_user(body.email, body.password)
        return {"message": "Account created", "email": user["email"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(body: AuthInput):
    try:
        return login_user(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))