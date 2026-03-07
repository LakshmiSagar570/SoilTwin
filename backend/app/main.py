from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import soil
from app.routes.auth import router as auth_router

app = FastAPI(title="Soil Digital Twin API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(soil.router, prefix="/api/soil", tags=["Soil"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "Soil Digital Twin API is running"}
