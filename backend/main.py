from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.analyze import router as analyze_router

app = FastAPI(title="Contract Risk Heatmap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://contractlens-ed9t1yvo3-vikaspatel11245s-projects.vercel.app",
        "https://contractlens-ai.vercel.app"
        "https://vercel.com/vikaspatel11245s-projects/contractlens/GRqr6YM5LH7icRvT8rU4PH3cNKc6"
        "https://contractlens-7h94w5n20-vikaspatel11245s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)

@app.get("/")
async def root():
    return {
        "status": "running",
        "message": "Contract Risk Heatmap backend is live"
    }