from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from services.pdf_parser import extract_text
from services.clause_extractor import extract_clauses
from services.risk_engine import analyze_clauses
from services.negotiation_engine import generate_suggestions
from services.pdf_annotator import annotate_pdf

router = APIRouter()

# temporary in-memory PDF store
pdf_store = {}

@router.post("/api/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    # validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # validate file size (max 20MB)
    pdf_bytes = await file.read()
    if len(pdf_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB")

    try:
        print("STEP 1 - File received:", file.filename)

        text = extract_text(pdf_bytes)
        print("STEP 2 - Text extracted:", len(text))

        clauses = extract_clauses(text)
        print("STEP 3 - Clauses extracted:", len(clauses))

        result = analyze_clauses(clauses)
        print("STEP 4 - Risk analysis complete")

        result.clauses = generate_suggestions(result.clauses)
        print("STEP 5 - Suggestions generated")

        annotated = annotate_pdf(pdf_bytes, result.clauses)
        pdf_store[result.pdf_id] = annotated
        print("STEP 6 - PDF annotated")

        return result

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/pdf/{pdf_id}")
async def get_annotated_pdf(pdf_id: str):
    pdf_bytes = pdf_store.get(pdf_id)
    if not pdf_bytes:
        raise HTTPException(status_code=404, detail="PDF not found")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=annotated.pdf"}
    )


@router.get("/api/health")
async def health():
    return {
        "status": "ok",
        "endpoints": [
            "POST /api/analyze",
            "GET /api/pdf/{pdf_id}"
        ]
    }