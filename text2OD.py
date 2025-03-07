import os
import json
from flask import Flask, request, jsonify
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration
from gptRun import gptResponse

app = Flask(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Current script directory
TEXT_JSON_FILE = os.path.join(BASE_DIR, "text.json")  # Path to text.json
OUTPUT_DIR = os.path.join(BASE_DIR, "pdf_output")  # Output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)  # Ensure output directory exists

# Font paths
FONT_PATH_TEXT = os.path.join(BASE_DIR, "OpenDyslexic3-Regular.ttf")
FONT_PATH_EMOJI = os.path.join(BASE_DIR, "NotoColorEmoji-Regular.ttf")

# Check if fonts exist
if not os.path.exists(FONT_PATH_TEXT):
    raise FileNotFoundError(f"Text font '{FONT_PATH_TEXT}' not found. Download it from https://opendyslexic.org.")

if not os.path.exists(FONT_PATH_EMOJI):
    raise FileNotFoundError(f"Emoji font '{FONT_PATH_EMOJI}' not found. Download it from https://fonts.google.com/noto/specimen/Noto+Emoji.")

# Get absolute paths to fonts for CSS
FONT_PATH_TEXT_ABS = os.path.abspath(FONT_PATH_TEXT)
FONT_PATH_EMOJI_ABS = os.path.abspath(FONT_PATH_EMOJI)

def read_text_from_json():
    """Read extracted text from text.json and return the 'text' key content."""
    if not os.path.exists(TEXT_JSON_FILE):
        raise FileNotFoundError("text.json not found in the directory.")

    with open(TEXT_JSON_FILE, "r", encoding="utf-8") as json_file:
        try:
            data = json.load(json_file)  # Load JSON content
        except json.JSONDecodeError:
            raise ValueError("text.json is corrupted or empty.")

    # Ensure 'text' key exists in JSON
    if "text" not in data:
        raise KeyError("'text' key not found in text.json.")

    return data["text"]  # Return the extracted text

def create_pdf_with_html(text, output_filename):
    """Generate a PDF with proper emoji support using WeasyPrint."""
    
    # Create HTML with embedded font face definitions
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @font-face {{
                font-family: 'OpenDyslexic';
                src: url('file://{FONT_PATH_TEXT_ABS}') format('truetype');
                font-weight: normal;
                font-style: normal;
            }}
            
            @font-face {{
                font-family: 'NotoEmoji';
                src: url('file://{FONT_PATH_EMOJI_ABS}') format('truetype');
                font-weight: normal;
                font-style: normal;
            }}
            
            body {{
                font-family: 'OpenDyslexic', 'NotoEmoji', sans-serif;
                font-size: 30px;
                line-height: 2;
                word-spacing: 5px;
                letter-spacing: 1.5px;
                margin: 50px;
            }}
            
            p {{
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
    """
    
    # Process text into paragraphs
    paragraphs = text.split('\n')
    for paragraph in paragraphs:
        if paragraph.strip():
            html_content += f"<p>{paragraph}</p>\n"
        else:
            html_content += "<br>\n"
    
    html_content += """
    </body>
    </html>
    """
    
    # Configure fonts
    font_config = FontConfiguration()
    
    # Generate PDF
    HTML(string=html_content).write_pdf(
        output_filename,
        font_config=font_config
    )
    
    return output_filename

@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    """API endpoint to generate a PDF with custom font and emoji support."""
    try:
        # Read text from text.json
        Text = read_text_from_json()
        text = gptResponse(Text)

        # Generate output file path
        output_pdf = os.path.join(OUTPUT_DIR, "dyslexic_friendly.pdf")

        # Generate PDF
        create_pdf_with_html(text, output_pdf)

        # Return file path in response
        return jsonify({
            "message": "PDF generated successfully.",
            "file_path": os.path.abspath(output_pdf)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)