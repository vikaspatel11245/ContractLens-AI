import re

def extract_clauses(text: str) -> list:
    clauses = []
    clause_id = 0
    
    # split by section numbers like 1. or 1.1 or Section 1
    pattern = r'(?=\n\s*(?:\d+\.[\d\.]*\s|Section\s+\d+))'
    sections = re.split(pattern, text)
    
    current_page = 1
    
    for section in sections:
        section = section.strip()
        if len(section) < 30:  # skip very short fragments
            continue
        
        # detect page number from our marker
        page_match = re.search(r'\[PAGE (\d+)\]', section)
        if page_match:
            current_page = int(page_match.group(1))
        
        # clean up page markers from text
        clean_text = re.sub(r'\[PAGE \d+\]', '', section).strip()
        
        if len(clean_text) < 30:
            continue
            
        clause_id += 1
        clauses.append({
            "id": f"clause_{clause_id}",
            "text": clean_text[:500],  # limit length
            "page": current_page
        })
    
    return clauses