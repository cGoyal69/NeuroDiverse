import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# Directory to save uploaded PDFs
UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure the directory exists

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    """API endpoint to upload and save a PDF file"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files['file']

    if not pdf_file.filename.endswith(".pdf"):
        return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400

    # Save PDF to the directory
    file_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
    pdf_file.save(file_path)

    return jsonify({
        "message": "PDF uploaded successfully.",
        "file_path": os.path.abspath(file_path)
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)