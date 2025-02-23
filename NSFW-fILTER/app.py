from flask import Flask, jsonify, request
from flask_cors import CORS
import opennsfw2 as n2
from PIL import Image
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Enable CORS to allow React to send requests

NSFW_THRESHOLD = 0.85  # Threshold for NSFW classification

def analyze_image(url):
    try:
        # Download the image
        response = requests.get(url)
        response.raise_for_status()  # Ensure request was successful

        # Open image using PIL
        image = Image.open(BytesIO(response.content))

        # Get NSFW probability
        nsfw_prob = n2.predict_image(image)

        # Classification decision
        is_nsfw = nsfw_prob >= NSFW_THRESHOLD

        print(f"Image URL: {url}")  
        return {
            "image_url": url,
            "nsfw_probability": round(nsfw_prob, 4),
            "classification": "NSFW" if is_nsfw else "SFW"
        }

    except Exception as e:
        return {
            "image_url": url,
            "error": str(e)
        }

@app.route('/', methods=['POST'])
def analyze_images():
    try:
        data = request.get_json()
        image_urls = data.get("image_urls", [])

        if not image_urls:
            return jsonify({"error": "No image URLs provided"}), 400

        # Process each image
        results = [analyze_image(url) for url in image_urls]

        return jsonify({"results": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
