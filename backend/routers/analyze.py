from fastapi import APIRouter, UploadFile, File
from services.pdf_parser import extract_text
from services.clause_extractor import extract_clauses
from services.risk_engine import analyze_clauses
from models.schemas import AnalysisResponse

router = APIRouter()

@router.post("/api/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    # Step 1 — read PDF bytes
    pdf_bytes = await file.read()
    
    # Step 2 — extract text
    text = extract_text(pdf_bytes)
    
    # Step 3 — split into clauses
    clauses = extract_clauses(text)
    
    # Step 4 — analyze risk
    results = analyze_clauses(clauses)
    
    return results