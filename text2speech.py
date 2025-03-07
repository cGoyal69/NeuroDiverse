import os
from flask import Flask, request, jsonify, send_file
from gtts import gTTS
import PyPDF2
import tempfile

app = Flask(__name__)

# Output directory for storing generated audio files
OUTPUT_DIR = "audio_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_text_from_pdf(pdf_path):
    """Extract text from a given PDF file."""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def convert_text_to_speech(text, lang="hi"):
    """Convert extracted text to speech and save as an MP3 file."""
    if not text.strip():
        raise ValueError("No valid text found in the PDF.")
    
    # Generate a temporary file path
    audio_file_path = os.path.join(OUTPUT_DIR, "output.mp3")
    
    # Convert text to speech
    tts = gTTS(text=text, lang=lang)
    tts.save(audio_file_path)
    
    return audio_file_path

@app.route("/pdf_to_speech", methods=["POST"])
def pdf_to_speech():
    """API endpoint to process PDF and return an MP3 file."""
    if 'file' not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400
    
    pdf_file = request.files["file"]
    
    if not pdf_file.filename.endswith(".pdf"):
        return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400
    
    # Save the uploaded PDF to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        pdf_path = temp_pdf.name
        pdf_file.save(pdf_path)
    
    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(pdf_path)
        
        # Convert extracted text to speech
        audio_file = convert_text_to_speech(extracted_text, lang="hi")
        
        # Return the generated audio file
        return send_file(audio_file, as_attachment=True, download_name="output.mp3", mimetype="audio/mpeg")
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Clean up temporary PDF file
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)