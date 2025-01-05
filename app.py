import os
import secrets
from flask import Flask, render_template, request, jsonify, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from dotenv import load_dotenv

from model_api import SYMPTOM_CODE_TO_DESC, query_llm
from utils import process_image_for_llm


def create_app():

    load_dotenv()
    app = Flask(__name__)

    # Load configurations (Development vs Production)
    if os.getenv("FLASK_ENV") == "production":
        app.config.from_object("config.ProductionConfig")
    else:
        app.config.from_object("config.DevelopmentConfig")

    # Middleware to generate nonce once per request
    @app.before_request
    def generate_nonce():
        g.nonce = secrets.token_urlsafe(16)

    # Security Headers (basic)
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; "
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://fonts.gstatic.com; "
            f"script-src 'self' 'nonce-{g.nonce}';"
        )
        return response


    @app.route('/')
    def index():
        """Render the main page"""
        return render_template('index.html', nonce=g.nonce)


    # Rate limiter to prevent abuse
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["30 per minute"]  # Adjust based on your traffic
    )

    @app.route('/process-image', methods=['POST'])
    @limiter.limit("1/2 seconds")  # Enforce rate limit: 1 request per 2 seconds
    def process_image():
        try:
            # Parse the image data from the request
            data = request.json
            
            # Validate the image
            image = data.get('image')
            if not image or not image.startswith("data:image/"):
                return jsonify({"error": "Invalid image format"}), 400
            
            # Validate the symptom
            symptom = data.get('symptom')
            valid_symptoms = SYMPTOM_CODE_TO_DESC.keys()
            if symptom not in valid_symptoms:
                return jsonify({"error": "Invalid symptom selected"}), 400

            # If both inputs seem valid, send to model
            processed_image_base64 = process_image_for_llm(image)
            response = query_llm(processed_image_base64, symptom_code=symptom).message.content
            # Respond to the frontend
            return jsonify({"message": response})
        except Exception as e:
            return jsonify({"error": str(e)}), 500


    @app.errorhandler(500)
    def internal_error(error):
        """Handle internal server errors gracefully."""
        return "Oops, looks like there an internal server error 🤷", 500


    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors gracefully."""
        return "Page not found 🤷", 404

    return app


# Run application
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
