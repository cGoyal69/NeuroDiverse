import os
import base64
import fitz  # PyMuPDF for text and image extraction
from flask import Flask, request, send_file, jsonify
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

app = Flask(__name__)

# Font paths
FONT_PATH_TEXT = "OpenDyslexic3-Regular.ttf"
FONT_PATH_EMOJI = "NotoColorEmoji-Regular.ttf"

# Directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "pdf_output"
IMAGE_DIR = "image_extracted"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

# Check if fonts exist
if not os.path.exists(FONT_PATH_TEXT):
    raise FileNotFoundError(f"Text font '{FONT_PATH_TEXT}' not found. Download it from https://opendyslexic.org.")

if not os.path.exists(FONT_PATH_EMOJI):
    raise FileNotFoundError(f"Emoji font '{FONT_PATH_EMOJI}' not found. Download it from https://fonts.google.com/noto/specimen/Noto+Emoji.")

# Get absolute paths to fonts for CSS
FONT_PATH_TEXT_ABS = os.path.abspath(FONT_PATH_TEXT)
FONT_PATH_EMOJI_ABS = os.path.abspath(FONT_PATH_EMOJI)

def extract_text_and_images(pdf_path):
    """Extracts text and images from a PDF."""
    doc = fitz.open(pdf_path)
    text = ""
    image_data_list = []

    for page_num, page in enumerate(doc):
        text += page.get_text("text") + "\n\n"

        # Extract images
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_img = doc.extract_image(xref)
            img_bytes = base_img["image"]
            img_ext = base_img["ext"]

            img_filename = f"page_{page_num+1}_img_{img_index+1}.{img_ext}"
            img_path = os.path.join(IMAGE_DIR, img_filename)

            with open(img_path, "wb") as img_file:
                img_file.write(img_bytes)

            # Convert image to base64 for embedding
            with open(img_path, "rb") as img_file:
                img_base64 = base64.b64encode(img_file.read()).decode()

            image_data_list.append({
                "base64": img_base64,
                "ext": img_ext
            })

    return text.strip(), image_data_list

def create_dyslexic_pdf(text, image_data_list, output_filename):
    """Creates a dyslexic-friendly PDF with extracted text & images."""
    
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
                font-size: 24px;
                line-height: 1.8;
                word-spacing: 4px;
                letter-spacing: 1.2px;
                margin: 40px;
                text-align: justify;
            }}
            
            p {{
                margin-bottom: 20px;
            }}

            img {{
                max-width: 100%;
                display: block;
                margin: 20px auto;
            }}
        </style>
    </head>
    <body>
    """

    paragraphs = text.split('\n')
    for paragraph in paragraphs:
        if paragraph.strip():
            html_content += f"<p>{paragraph}</p>\n"
        else:
            html_content += "<br>\n"

    # Embed images using base64
    for img_data in image_data_list:
        html_content += f'<img src="data:image/{img_data["ext"]};base64,{img_data["base64"]}" alt="Extracted Image">\n'

    html_content += """
    </body>
    </html>
    """

    font_config = FontConfiguration()
    HTML(string=html_content).write_pdf(output_filename, font_config=font_config)

    return output_filename

@app.route('/convert_pdf', methods=['POST'])
def convert_pdf():
    """API endpoint to convert a normal PDF to a dyslexic-friendly PDF."""
    
    if 'file' not in request.files:
        return jsonify({"error": "No PDF file uploaded."}), 400

    pdf_file = request.files['file']

    if pdf_file.filename == '':
        return jsonify({"error": "No file selected."}), 400

    # Save uploaded PDF
    pdf_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
    pdf_file.save(pdf_path)

    # Extract text & images
    text, image_data_list = extract_text_and_images(pdf_path)

    # Generate output PDF
    output_pdf = os.path.join(OUTPUT_DIR, "dyslexic_friendly.pdf")
    create_dyslexic_pdf(text, image_data_list, output_pdf)

    return send_file(output_pdf, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)