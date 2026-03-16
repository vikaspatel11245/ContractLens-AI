import re
import json
import os
from dotenv import load_dotenv
from groq import Groq
from models.schemas import ClauseResult, AnalysisResponse

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_clauses(clauses: list) -> AnalysisResponse:
    limited_clauses = clauses[:10]

    clause_text = ""
    for c in limited_clauses:
        safe_text = c["text"][:200].replace('"', "'").replace('\n', ' ')
        clause_text += f'\n{{"id": "{c["id"]}", "text": "{safe_text}", "page": {c["page"]}}}'

    prompt = f"""You are a SaaS contract risk analyst. Analyze each clause and return ONLY a valid JSON array. No explanation, no markdown, no extra text.

For each clause return these exact fields:
- clause_id: string
- text: string  
- page: number
- score: number 1-10 (10 = highest risk)
- category: one of: liability, ip, payment, termination, data, auto_renewal, general
- severity: one of: low, medium, high, critical
- reasoning: one sentence plain English
- suggestions: array of strings (empty array if low risk)

Clauses to analyze:
{clause_text}

Return ONLY a raw JSON array, nothing else."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a contract risk analyst. Always respond with valid JSON only. No markdown, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=4096,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = re.sub(r'^```json?\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)

    clause_results = json.loads(raw)

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