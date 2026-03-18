from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyze import router as analyze_router  # ✅ fixed

app = FastAPI(title="Contract Risk Heatmap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://contractlens-ed9t1yvo3-vikaspatel11245s-projects.vercel.app",
        "https://contractlens-xi.vercel.app/"
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