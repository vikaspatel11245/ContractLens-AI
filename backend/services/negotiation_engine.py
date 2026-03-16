import re
import json
import os
from dotenv import load_dotenv
from groq import Groq
from models.schemas import ClauseResult

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_suggestions(clauses: list) -> list:
    # only process high and critical clauses
    risky_clauses = [c for c in clauses if c.severity in ["high", "critical"]]
    
    if not risky_clauses:
        return clauses
    
    # take top 5 risky clauses only
    top_clauses = risky_clauses[:5]
    
    clause_text = ""
    for c in top_clauses:
        safe_text = c.text[:300].replace('"', "'").replace('\n', ' ')
        clause_text += f'\n{{"id": "{c.clause_id}", "text": "{safe_text}"}}'
    
    prompt = f"""You are a SaaS contract negotiation expert. For each clause below generate negotiation suggestions.

Return ONLY a valid JSON array. No markdown, no explanation.

For each clause return:
- clause_id: string (same as input)
- suggestions: array of 2 strings (rewrite suggestions)
- ask_for: string (one sentence - what to ask the other party for)

Clauses:
{clause_text}

Return ONLY raw JSON array."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a contract negotiation expert. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = re.sub(r'^```json?\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)

    suggestions_map = {}
    suggestion_results = json.loads(raw)
    for s in suggestion_results:
        suggestions_map[s["clause_id"]] = {
            "suggestions": s.get("suggestions", []),
            "ask_for": s.get("ask_for", "")
        }

    # merge suggestions back into clauses
    updated_clauses = []
    for c in clauses:
        if c.clause_id in suggestions_map:
            updated = c.model_copy(update={
                "suggestions": suggestions_map[c.clause_id]["suggestions"]
            })
            updated_clauses.append(updated)
        else:
            updated_clauses.append(c)

    return updated_clauses