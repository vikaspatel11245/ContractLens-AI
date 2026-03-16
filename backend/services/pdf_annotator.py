import fitz  # PyMuPDF
import os
from models.schemas import ClauseResult

# risk color map — RGB values for PyMuPDF
RISK_COLORS = {
    "critical": (0.97, 0.76, 0.76),   # red
    "high":     (0.98, 0.78, 0.46),   # amber
    "medium":   (0.98, 0.93, 0.46),   # yellow
    "low":      (0.75, 0.87, 0.59),   # green
}

def annotate_pdf(pdf_bytes: bytes, clauses: list) -> bytes:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    for clause in clauses:
        if clause.severity == "low":
            continue  # skip low risk clauses

        color = RISK_COLORS.get(clause.severity, RISK_COLORS["medium"])
        page_num = clause.page - 1  # convert to 0-indexed

        if page_num < 0 or page_num >= len(doc):
            continue

        page = doc[page_num]

        # search for the clause text on the page
        search_text = clause.text[:100].strip()
        
        # try searching with first 50 chars
        instances = page.search_for(search_text[:50])

        if instances:
            for rect in instances:
                # add highlight annotation
                highlight = page.add_highlight_annot(rect)
                highlight.set_colors(stroke=color)
                highlight.update()

    # save annotated PDF to bytes
    output_bytes = doc.tobytes()
    doc.close()
    return output_bytes