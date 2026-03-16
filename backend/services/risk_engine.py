import re
import anthropic
import json
import os
from models.schemas import ClauseResult, AnalysisResponse

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def analyze_clauses(clauses: list) -> AnalysisResponse:
    # build clause list for prompt
    clause_text = ""
    for c in clauses:
        clause_text += f'\n{{"id": "{c["id"]}", "text": "{c["text"][:300]}"}}'
    
    prompt = f"""You are a SaaS contract risk analyst. Analyze each clause below and return ONLY a valid JSON array. No explanation, no markdown, just raw JSON.

For each clause return:
- clause_id: the id provided
- text: the clause text
- page: page number as given
- score: risk score 1-10 (10 = highest risk)
- category: one of: liability, ip, payment, termination, data, auto_renewal, general
- severity: one of: low, medium, high, critical
- reasoning: one sentence plain English explanation of the risk
- suggestions: array of 1-2 rewrite suggestions (empty array if low risk)

Clauses to analyze:
{clause_text}

Return ONLY a JSON array like:
[{{"clause_id":"...","text":"...","page":1,"score":5,"category":"payment","severity":"medium","reasoning":"...","suggestions":[]}}]"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw = response.content[0].text.strip()
    
    # clean markdown if Claude wraps in ```json
    if raw.startswith("```"):
        raw = re.sub(r'^```json?\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)
    
    clause_results = json.loads(raw)
    
    # calculate overall score
    if not clause_results:
        overall = 0
    else:
        weights = {"critical": 3, "high": 2, "medium": 1, "low": 0.5}
        total = sum(c["score"] * weights.get(c["severity"], 1) for c in clause_results)
        max_possible = len(clause_results) * 10 * 3
        overall = int((total / max_possible) * 100)
    
    results = [ClauseResult(**c) for c in clause_results]
    
    return AnalysisResponse(
        clauses=results,
        overall_score=overall,
        pdf_id="pdf_001"
    )