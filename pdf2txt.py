import os
import json
from flask import Flask, request, jsonify
import fitz  # PyMuPDF

app = Flask(__name__)

# Define directories and files
UPLOAD_FOLDER = "./uploads"
TEXT_JSON_FILE = "text.json"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure directory exists

def extract_text_from_pdf(pdf_path):
    """Extract text from the given PDF file."""
    text = ""
    doc = fitz.open(pdf_path)  # Open the PDF file
    for page in doc:
        text += page.get_text("text")  # Extract text from each page
    return text

def save_text_to_json(extracted_text):
    """Save extracted text into text.json"""
    data = {}

    # Load existing data if file exists
    if os.path.exists(TEXT_JSON_FILE):
        with open(TEXT_JSON_FILE, "r", encoding="utf-8") as json_file:
            try:
                data = json.load(json_file)
            except json.JSONDecodeError:
                data = {}  # Reset in case of corruption

    # Add new entry
    data['text'] = extracted_text

    # Write back to JSON file
    with open(TEXT_JSON_FILE, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint to upload a PDF, extract its text, and save it to text.json"""
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

    # Save text to JSON
    save_text_to_json(extracted_text)

    return jsonify({'message': 'Text extracted and saved to text.json', 'file_name': file.filename})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)