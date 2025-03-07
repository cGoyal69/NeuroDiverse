import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    text = ""
    doc = fitz.open(pdf_path)  # Open the PDF file
    for page in doc:
        text += page.get_text("text")  # Extract text from each page
    return text

# Example usage
pdf_file = "sample.pdf"  # Replace with your PDF file path
extracted_text = extract_text_from_pdf(pdf_file)
print(extracted_text)