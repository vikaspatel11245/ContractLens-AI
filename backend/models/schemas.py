from pydantic import BaseModel
from typing import List, Optional

class ClauseResult(BaseModel):
    clause_id: str
    text: str
    page: int
    score: int
    category: str
    severity: str
    reasoning: str
    suggestions: List[str] = []
    ask_for: Optional[str] = ""

class AnalysisResponse(BaseModel):
    clauses: List[ClauseResult]
    overall_score: int
    pdf_id: str