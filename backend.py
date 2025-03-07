import os
import json
import tempfile
from flask import Flask, request, jsonify, send_file
from gtts import gTTS
import PyPDF2
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration
from gptRun import gptResponse, getSummary

app = Flask(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEXT_JSON_FILE = os.path.join(BASE_DIR, "text.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Font paths
FONT_PATH_TEXT = os.path.join(BASE_DIR, "OpenDyslexic3-Regular.ttf")
FONT_PATH_EMOJI = os.path.join(BASE_DIR, "NotoColorEmoji-Regular.ttf")

# Check font existence
for font in [FONT_PATH_TEXT, FONT_PATH_EMOJI]:
    if not os.path.exists(font):
        raise FileNotFoundError(f"Font '{font}' not found.")

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())

# Convert text to speech
def convert_text_to_speech(text, lang="hi"):
    if not text.strip():
        raise ValueError("No valid text found in the PDF.")
    audio_file_path = os.path.join(OUTPUT_DIR, "output.mp3")
    gTTS(text=text, lang=lang).save(audio_file_path)
    return audio_file_path

# Read text.json
def read_text_from_json():
    if not os.path.exists(TEXT_JSON_FILE):
        return {"error": "text.json file not found."}
    try:
        with open(TEXT_JSON_FILE, "r", encoding="utf-8") as json_file:
            data = json.load(json_file)
        return {"text": data.get("text", "")}
    except json.JSONDecodeError:
        return {"error": "text.json is corrupted or empty."}

# Generate PDF from text
def create_pdf_with_html(text, output_filename):
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            @font-face {{ font-family: 'OpenDyslexic'; src: url('file://{os.path.abspath(FONT_PATH_TEXT)}') format('truetype'); }}
            @font-face {{ font-family: 'NotoEmoji'; src: url('file://{os.path.abspath(FONT_PATH_EMOJI)}') format('truetype'); }}
            body {{ font-family: 'OpenDyslexic', 'NotoEmoji', sans-serif; font-size: 30px; line-height: 2; }}
        </style>
    </head>
    <body>
        {text.replace('\n', '<br>')}
    </body>
    </html>
    """
    HTML(string=html_content).write_pdf(output_filename, font_config=FontConfiguration())
    return output_filename

# PDF to Speech API
@app.route("/pdf_to_speech", methods=["POST"])
def pdf_to_speech():
    if 'file' not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400
    pdf_file = request.files["file"]
    if not pdf_file.filename.endswith(".pdf"):
        return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        pdf_path = temp_pdf.name
        pdf_file.save(pdf_path)
    try:
        extracted_text = extract_text_from_pdf(pdf_path)
        audio_file = convert_text_to_speech(extracted_text, lang="hi")
        return send_file(audio_file, as_attachment=True, download_name="output.mp3", mimetype="audio/mpeg")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(pdf_path)

# Generate Dyslexic-friendly PDF API
@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    try:
        text_data = read_text_from_json()
        if "error" in text_data:
            return jsonify(text_data), 400
        processed_text = gptResponse(text_data["text"])
        output_pdf = os.path.join(OUTPUT_DIR, "dyslexic_friendly.pdf")
        create_pdf_with_html(processed_text, output_pdf)
        return jsonify({"message": "PDF generated successfully.", "file_path": os.path.abspath(output_pdf)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get summarized text API
@app.route('/get_text', methods=['GET'])
def get_text():
    text_data = read_text_from_json()
    if "error" in text_data:
        return jsonify(text_data), 400
    return jsonify(getSummary(text_data))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)