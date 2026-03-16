from pydantic import BaseModel
from typing import List

class ClauseResult(BaseModel):
    clause_id: str
    text: str
    page: int
    score: int            # 1-10 (10 = highest risk)
    category: str         # liability | ip | payment | termination | data | auto_renewal
    severity: str         # low | medium | high | critical
    reasoning: str        # one sentence plain-English explanation
    suggestions: List[str]

class AnalysisResponse(BaseModel):
    clauses: List[ClauseResult]
    overall_score: int    # 0-100
    pdf_id: str