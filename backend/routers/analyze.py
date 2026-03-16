from fastapi import APIRouter, UploadFile, File
from fastapi.responses import Response
from services.pdf_parser import extract_text
from services.clause_extractor import extract_clauses
from services.risk_engine import analyze_clauses
from services.negotiation_engine import generate_suggestions
from services.pdf_annotator import annotate_pdf

router = APIRouter()

# store annotated PDF in memory temporarily
pdf_store = {}

@router.post("/api/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    print("STEP 1 - File received:", file.filename)

    pdf_bytes = await file.read()
    print("STEP 2 - PDF bytes read:", len(pdf_bytes))

    text = extract_text(pdf_bytes)
    print("STEP 3 - Text extracted, length:", len(text))

    clauses = extract_clauses(text)
    print("STEP 4 - Clauses extracted:", len(clauses))

    result = analyze_clauses(clauses)
    print("STEP 5 - Risk analysis complete")

    result.clauses = generate_suggestions(result.clauses)
    print("STEP 6 - Negotiation suggestions generated")

    annotated = annotate_pdf(pdf_bytes, result.clauses)
    pdf_store[result.pdf_id] = annotated
    print("STEP 7 - PDF annotated")

    return result


@router.get("/api/pdf/{pdf_id}")
async def get_annotated_pdf(pdf_id: str):
    pdf_bytes = pdf_store.get(pdf_id)
    if not pdf_bytes:
        return {"error": "PDF not found"}
    return Response(
        content=pdf_bytes,
        media_type="application/pdf"
    )