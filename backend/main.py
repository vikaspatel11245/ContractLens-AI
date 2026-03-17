from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import analyze

load_dotenv()

app = FastAPI(title="Contract Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Contract Risk API running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(analyze.router)