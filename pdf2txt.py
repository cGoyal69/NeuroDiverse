import os
from flask import Flask, request, jsonify
import fitz  # PyMuPDF

app = Flask(__name__)

# Define the upload directory
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure directory exists

def extract_text_from_pdf(pdf_path):
    """Extract text from the given PDF file."""
    text = ""
    doc = fitz.open(pdf_path)  # Open the PDF file
    for page in doc:
        text += page.get_text("text")  # Extract text from each page
    return text

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint to upload a PDF and extract its text."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Extract text from the saved PDF
    extracted_text = extract_text_from_pdf(file_path)

    return jsonify({'extracted_text': extracted_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)