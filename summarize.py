import os
import json
from flask import Flask, jsonify
from gptRun import getSummary

app = Flask(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Current script directory
TEXT_JSON_FILE = os.path.join(BASE_DIR, "text.json")  # Path to text.json

def read_text_from_json():
    """Read extracted text from text.json and return the 'text' key content."""
    if not os.path.exists(TEXT_JSON_FILE):
        return {"error": "text.json file not found."}

    with open(TEXT_JSON_FILE, "r", encoding="utf-8") as json_file:
        try:
            data = json.load(json_file)  # Load JSON content
        except json.JSONDecodeError:
            return {"error": "text.json is corrupted or empty."}

    # Ensure 'text' key exists in JSON
    if "text" not in data:
        return {"error": "'text' key not found in text.json."}

    return {"text": data["text"]}  # Return the extracted text

@app.route('/get_text', methods=['GET'])
def get_text():
    """API endpoint to fetch text from text.json."""
    response1 = read_text_from_json()
    response = getSummary(response1)
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)