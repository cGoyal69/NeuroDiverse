import os
from flask import Flask, request, send_file, jsonify
import tempfile
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

app = Flask(__name__)

# Font paths
FONT_PATH_TEXT = "OpenDyslexic3-Regular.ttf"
FONT_PATH_EMOJI = "NotoColorEmoji-Regular.ttf"

# Output directory for PDFs
OUTPUT_DIR = "pdf_output"

# Ensure the output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Check if fonts exist
if not os.path.exists(FONT_PATH_TEXT):
    raise FileNotFoundError(f"Text font '{FONT_PATH_TEXT}' not found. Download it from https://opendyslexic.org.")

if not os.path.exists(FONT_PATH_EMOJI):
    raise FileNotFoundError(f"Emoji font '{FONT_PATH_EMOJI}' not found. Download it from https://fonts.google.com/noto/specimen/Noto+Emoji.")

# Get absolute paths to fonts for CSS
FONT_PATH_TEXT_ABS = os.path.abspath(FONT_PATH_TEXT)
FONT_PATH_EMOJI_ABS = os.path.abspath(FONT_PATH_EMOJI)

def create_pdf_with_html(text, output_filename):
    """Generate a PDF with proper emoji support using WeasyPrint"""
    
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
                line-height: 2; /* Increased line spacing */
                word-spacing: 5px; /* Increased word spacing */
                letter-spacing: 1.5px; /* Increased character spacing */
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
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' parameter in request"}), 400

    text = data["text"]
    
    # Generate output file path
    output_pdf = os.path.join(OUTPUT_DIR, "dyslexic_friendly.pdf")

    # Generate PDF
    create_pdf_with_html(text, output_pdf)

    # Return file path in response
    return jsonify({
        "message": "PDF generated successfully.",
        "file_path": os.path.abspath(output_pdf)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

