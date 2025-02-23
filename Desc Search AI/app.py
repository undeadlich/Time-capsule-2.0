import requests
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import pickle
from numpy.linalg import norm
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from sentence_transformers import SentenceTransformer

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
MODELS_DIR = "models"
DB_FILE = os.path.join(MODELS_DIR, "image_database.pkl")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

class ImageRetrievalSystem:
    def __init__(self):
        self.processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", cache_dir=MODELS_DIR)
        self.caption_model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base",
            cache_dir=MODELS_DIR
        ).to(DEVICE)
        self.embedder = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2",
            cache_folder=MODELS_DIR
        ).to(DEVICE)

        self.database = self.load_database()

    def load_database(self):
        """Load processed images from previous sessions"""
        if os.path.exists(DB_FILE):
            with open(DB_FILE, "rb") as f:
                return pickle.load(f)
        return []

    def save_database(self):
        """Save current state to disk"""
        os.makedirs(MODELS_DIR, exist_ok=True)
        with open(DB_FILE, "wb") as f:
            pickle.dump(self.database, f)

    def generate_caption(self, image):
        """Generate a caption for an image object"""
        inputs = self.processor(image, return_tensors="pt").to(DEVICE)
        output = self.caption_model.generate(**inputs)
        return self.processor.decode(output[0], skip_special_tokens=True)

    def process_images(self, image_urls):
        """Process multiple images from URLs and return captions & embeddings"""
        results = []

        for image_url in image_urls:
            try:
                response = requests.get(image_url)
                response.raise_for_status()
                image = Image.open(BytesIO(response.content)).convert("RGB")
            except requests.exceptions.RequestException as e:
                results.append({"url": image_url, "error": f"Failed to download image: {str(e)}"})
                continue

            caption = self.generate_caption(image)
            embedding = self.embedder.encode(caption, convert_to_tensor=True).cpu().numpy()

            # Store in database
            self.database.append({
                "url": image_url,
                "caption": caption,
                "embedding": embedding.tolist()
            })

            results.append({
                "url": image_url,
                "caption": caption,
                "embedding": embedding.tolist()
            })

        self.save_database()
        return results

    def search_images(self, query):
        """Search for images that match the query based on caption embeddings,
           returning only those with similarity > 0.3"""
        query_embedding = self.embedder.encode(query, convert_to_tensor=True).cpu().numpy()
        results = []

        for entry in self.database:
            similarity = np.dot(query_embedding, entry["embedding"]) / (
                norm(query_embedding) * norm(entry["embedding"])
            )
            # Only include entries with similarity > 0.3
            if similarity > 0.3:
                results.append({
                    "url": entry["url"],
                    "caption": entry["caption"],
                    "similarity": similarity
                })

        # Sort results by similarity in descending order
        results = sorted(results, key=lambda x: x["similarity"], reverse=True)
        return results

# Initialize the system
system = ImageRetrievalSystem()

@app.route("/process", methods=["POST"])
def process_images_route():
    """API endpoint to process images from URLs"""
    data = request.json
    image_urls = data.get("image_urls")  # Expecting an array of image URLs

    if not image_urls or not isinstance(image_urls, list):
        return jsonify({"error": "Invalid or missing image URLs"}), 400

    results = system.process_images(image_urls)
    return jsonify({"results": results})

@app.route("/search", methods=["POST"])
def search_images_route():
    """API endpoint to search for images based on a text query,
       returning only those with similarity > 0.3"""
    data = request.json
    query = data.get("query")  # Expecting a search query string

    if not query or not isinstance(query, str):
        return jsonify({"error": "Invalid or missing query"}), 400

    results = system.search_images(query)
    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(debug=True)
