import os
import fitz  # PyMuPDF for PDF processing
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

# Directories for uploads and output files
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "compressed_pdfs"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def compress_pdf(input_pdf, output_pdf, quality=80, dpi=150):
    """Compress PDF by reducing image quality & DPI"""
    doc = fitz.open(input_pdf)

    for page in doc:
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_img = doc.extract_image(xref)
            img_bytes = base_img["image"]

            # Convert image to a lower-quality version
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha > 3:  # Convert CMYK to RGB
                pix = fitz.Pixmap(fitz.csRGB, pix)

            # Save image with lower quality
            pix.writePNG("temp_img.png")
            new_pix = fitz.Pixmap("temp_img.png")
            doc.insert_image(page.rect, filename="temp_img.png")

    # Save compressed PDF
    doc.save(output_pdf, garbage=4, deflate=True)
    doc.close()

@app.route('/convert_pdf', methods=['POST'])
def convert_pdf():
    """API endpoint to process PDF and return a modified PDF"""
    
    print("Received request at /convert_pdf")
    print("Request Files:", request.files)  # Debugging print statement

    if 'pdf' not in request.files:
        return jsonify({"error": "No PDF file uploaded. Make sure the key is 'pdf'"}), 400

    pdf_file = request.files['pdf']

    if pdf_file.filename == '':
        return jsonify({"error": "No file selected."}), 400

    # Save uploaded PDF
    input_pdf_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
    pdf_file.save(input_pdf_path)

    # Generate output file path
    output_pdf_path = os.path.join(OUTPUT_DIR, f"converted_{pdf_file.filename}")

    # Compress PDF (you can modify logic as needed)
    compress_pdf(input_pdf_path, output_pdf_path)

    return send_file(output_pdf_path, as_attachment=True)

@app.route('/convert_pdf', methods=['POST'])
def convert_pdf():
    """API endpoint to process PDF and return a modified PDF"""
    
    print("📩 Received request at /convert_pdf")  # Debugging Log
    print("🔍 Request Headers:", request.headers)  # Check headers
    print("📂 Request Files:", request.files)  # Debugging request.files

    # ✅ Check if the key exists in request.files
    if 'pdf' not in request.files:
        return jsonify({
            "error": "No PDF file uploaded. Make sure the key is 'pdf'",
            "files_received": list(request.files.keys())  # Show received keys
        }), 400

    pdf_file = request.files['pdf']

    if pdf_file.filename == '':
        return jsonify({"error": "No file selected."}), 400

    # Save uploaded PDF
    input_pdf_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
    pdf_file.save(input_pdf_path)

    # Generate output file path
    output_pdf_path = os.path.join(OUTPUT_DIR, f"converted_{pdf_file.filename}")

    # Compress PDF (you can modify logic as needed)
    compress_pdf(input_pdf_path, output_pdf_path)

    return send_file(output_pdf_path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)