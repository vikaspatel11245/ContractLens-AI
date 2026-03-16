import fitz  # PyMuPDF

def extract_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    
    for page_num, page in enumerate(doc):
        text = page.get_text()
        full_text += f"\n[PAGE {page_num + 1}]\n{text}"
    
    doc.close()
    return full_text