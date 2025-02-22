from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS to allow requests from frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure secret key for JWT
app.config['SECRET_KEY'] = 'your-secret-key-here'  # In production, use a secure secret key

# Import routes after app is initialized to avoid circular imports
from app import routes

if __name__ == "__main__":
    app.run(debug=True)
