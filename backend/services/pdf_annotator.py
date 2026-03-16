import fitz  # PyMuPDF
import os
import re
from models.schemas import ClauseResult

# risk color map — RGB values for PyMuPDF
RISK_COLORS = {
    "critical": (0.97, 0.76, 0.76),   # red
    "high":     (0.98, 0.78, 0.46),   # amber
    "medium":   (0.98, 0.93, 0.46),   # yellow
    "low":      (0.75, 0.87, 0.59),   # green
}

def normalize_text(text: str) -> str:
    """Normalize text for better matching against PDF text layer."""
    if not text:
        return ""
    # Replace smart quotes/dashes
    text = text.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    text = text.replace('—', '-').replace('–', '-')
    # Handle common PDF ligatures or hyphenation if they were joined
    # (Though usually get_text() handles this, search_for needs clean text)
    text = re.sub(r'(\w)-\s+(\w)', r'\1\2', text) 
    # Replace multiple spaces/newlines with single space
    text = " ".join(text.split())
    return text

def annotate_pdf(pdf_bytes: bytes, clauses: list) -> bytes:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    for clause in clauses:
        if clause.severity == "low":
            continue 

        color = RISK_COLORS.get(clause.severity, RISK_COLORS["medium"])
        
        # Some clauses might span pages, but our extractor currently assigns one page.
        # We search on the assigned page, and if it fails, we search +/- 1 page.
        target_pages = [clause.page - 1]
        if clause.page > 1: target_pages.append(clause.page - 2)
        if clause.page < len(doc): target_pages.append(clause.page)

        full_text = normalize_text(clause.text)
        
        # Clean start (remove leading digits/bullets)
        search_target = re.sub(r'^[A-Z0-9]{1,3}[\.\)\-]\s*', '', full_text, flags=re.IGNORECASE)
        if len(search_target) < 20: search_target = full_text

        # Chunks for highlighting
        words = search_target.split()
        chunks = []
        tmp = []
        curr = 0
        for w in words:
            tmp.append(w)
            curr += len(w) + 1
            if curr >= 50:
                chunks.append(" ".join(tmp))
                tmp = []
                curr = 0
        if tmp: chunks.append(" ".join(tmp))

        # Attempt to highlight each chunk on the possible pages
        for p_idx in target_pages:
            if p_idx < 0 or p_idx >= len(doc): continue
            page = doc[p_idx]
            
            found_any = False
            # We try to highlight up to 10 chunks per clause to cover significant text
            for snippet in chunks[:10]:
                if len(snippet) < 12: continue
                
                # Try finding exact snippet
                instances = page.search_for(snippet)
                
                # If fail, try a fuzzy match by removing punctuation
                if not instances:
                    simple_snippet = re.sub(r'[^\w\s]', '', snippet)
                    if len(simple_snippet) > 15:
                        instances = page.search_for(simple_snippet)

                if instances:
                    highlight = page.add_highlight_annot(instances)
                    highlight.set_colors(stroke=color)
                    highlight.update()
                    found_any = True
            
            # If we found matches on the primary page, we don't need to check other pages
            if found_any and p_idx == target_pages[0]:
                break
                
    output_bytes = doc.tobytes()
    doc.close()
    return output_bytes