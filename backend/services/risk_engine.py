import re
import json
import os
import uuid
import time
from dotenv import load_dotenv
from groq import Groq
from models.schemas import ClauseResult, AnalysisResponse

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_clauses(clauses: list) -> AnalysisResponse:
    active_clauses = clauses[:15]

    clause_data_for_llm = []
    for c in active_clauses:
        snippet = c["text"][:300].replace('\n', ' ').strip()
        clause_data_for_llm.append({
            "id": c["id"],
            "text": snippet,
            "page": c["page"]
        })

    clause_text_block = json.dumps(clause_data_for_llm)

    prompt = f"""You are a SaaS contract risk analyst. Analyze each clause and return ONLY a valid JSON array. No explanation, no markdown, no extra text.

For each clause return these exact fields:
- clause_id: string (must match the input id)
- score: number 1-10 (10 = highest risk)
- category: one of: liability, ip, payment, termination, data, auto_renewal, general
- severity: one of: low, medium, high, critical
- reasoning: one sentence plain English
- suggestions: array of strings (empty array if low risk)

Clauses to analyze:
{clause_text_block}

Return ONLY a raw JSON array, nothing else."""

    for attempt in range(3):
        try:
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
            break
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(10)
                continue
            raise e

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = re.sub(r'^```json?\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)

    llm_results = json.loads(raw)

    clause_lookup = {c["id"]: c for c in active_clauses}
    final_results = []

    for r in llm_results:
        cid = r.get("clause_id")
        if cid in clause_lookup:
            orig = clause_lookup[cid]
            final_results.append(ClauseResult(
                clause_id=cid,
                text=orig["text"],
                page=orig["page"],
                score=r["score"],
                category=r["category"],
                severity=r["severity"],
                reasoning=r["reasoning"],
                suggestions=r.get("suggestions", [])
            ))

    if not final_results:
        overall = 0
    else:
        weights = {"critical": 3, "high": 2, "medium": 1, "low": 0.5}
        total = sum(c.score * weights.get(c.severity, 1) for c in final_results)
        max_possible = len(final_results) * 10 * 3
        overall = int((total / max_possible) * 100)

    return AnalysisResponse(
        clauses=final_results,
        overall_score=overall,
        pdf_id=str(uuid.uuid4())
    )