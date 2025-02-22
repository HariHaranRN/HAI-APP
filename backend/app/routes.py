from flask import jsonify, request, make_response
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from app import app
import re
import json

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Handle OPTIONS requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response

from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
try:
    import jwt
except ImportError:
    try:
        from jwt import JWT, jwk_from_pem
        jwt = JWT()
    except ImportError:
        try:
            import PyJWT as jwt
        except ImportError:
            raise ImportError("Could not import JWT. Please install with: pip install PyJWT[crypto]")

# Set up MongoDB connection 
client = MongoClient('mongodb://localhost:27017/') 
db = client['demo']
collection = db['data']
users_collection = db['users']
books_collection = db['books']
reviews_collection = db['reviews']

# Initialize sample books data
def init_sample_books():
    if books_collection.count_documents({}) == 0:
        sample_books = [
            {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "category": "Fiction",
                "description": "A story of decadence and excess."
            },
            {
                "title": "Dune",
                "author": "Frank Herbert",
                "category": "Science Fiction",
                "description": "A sweeping epic of interstellar politics and adventure."
            },
            {
                "title": "The Hobbit",
                "author": "J.R.R. Tolkien",
                "category": "Fantasy",
                "description": "A tale of adventure in Middle-earth."
            },
            {
                "title": "Pride and Prejudice",
                "author": "Jane Austen",
                "category": "Fiction",
                "description": "A classic story of love and misunderstanding."
            }
        ]
        books_collection.insert_many(sample_books)

# Initialize sample data
init_sample_books()

# Configure JWT
app.config['SECRET_KEY'] = 'your-secret-key-here'  # In production, use a secure secret key
JWT_EXPIRATION_HOURS = 24

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_password(password):
    # Minimum 8 characters, at least one letter, one number, and one special character
    if len(password) < 8:
        return False
    if not re.search(r'[A-Za-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

def generate_token(user_id):
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    return jwt.encode(
        {'user_id': str(user_id), 'exp': expiration},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )

from functools import wraps

# Authentication helpers
def verify_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = verify_token()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 403
        return f(*args, **kwargs)
    return decorated

# Public routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({
            'error': 'Email and password are required'
        }), 400

    email = data['email']
    password = data['password']

    # Find user by email
    user = users_collection.find_one({'email': email})
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({
            'error': 'Invalid email or password'
        }), 401

    # Generate JWT token
    token = generate_token(user['_id'])
    
    return jsonify({
        'message': 'Login successful',
        'email': email,
        'token': token
    }), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({
            'error': 'Email and password are required'
        }), 400

    email = data['email']
    password = data['password']

    # Validate email format
    if not is_valid_email(email):
        return jsonify({
            'error': 'Invalid email format'
        }), 400

    # Validate password complexity
    if not is_valid_password(password):
        return jsonify({
            'error': 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character'
        }), 400

    # Check if email already exists
    if users_collection.find_one({'email': email}):
        return jsonify({
            'error': 'Email already registered'
        }), 409

    # Hash password and create user
    hashed_password = generate_password_hash(password)
    user = {
        'email': email,
        'password': hashed_password,
        'created_at': datetime.utcnow()
    }

    try:
        result = users_collection.insert_one(user)
        token = generate_token(result.inserted_id)
        return jsonify({
            'message': 'Registration successful',
            'email': email,
            'token': token
        }), 201
    except Exception as e:
        return jsonify({
            'error': 'Registration failed',
            'message': str(e)
        }), 500

# Protected routes - require authentication
@app.route('/api/books', methods=['GET', 'POST', 'OPTIONS'])
def books():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        return response

    if request.method in ['GET', 'POST']:
        user_id = verify_token()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 403

    if request.method == 'GET':
        search_query = request.args.get('q', '')
        category = request.args.get('category', '')
        
        query = {}
        if search_query:
            search_regex = re.compile(search_query, re.IGNORECASE)
            query['$or'] = [
                {'title': search_regex},
                {'author': search_regex},
                {'description': search_regex}
            ]
        if category:
            query['category'] = category

        books = list(books_collection.find(query))
        # Convert ObjectId to string for each book
        for book in books:
            book['_id'] = str(book['_id'])
        categories = books_collection.distinct('category')
        
        return jsonify({
            'books': books,
            'categories': categories
        })

    elif request.method == 'POST':
        data = request.get_json()
        required_fields = ['title', 'author', 'description', 'category']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = verify_token()
        book = {
            'title': data['title'],
            'author': data['author'],
            'description': data['description'],
            'category': data['category'],
            'recommended_by': user_id,
            'created_at': datetime.utcnow()
        }
        
        try:
            result = books_collection.insert_one(book)
            book['_id'] = str(result.inserted_id)
            return jsonify(book), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/books/<book_id>/reviews', methods=['GET', 'POST'])
@auth_required
def book_reviews(book_id):
    if request.method == 'GET':
        reviews = list(reviews_collection.find({'book_id': book_id}))
        for review in reviews:
            review['_id'] = str(review['_id'])
            user = users_collection.find_one({'_id': ObjectId(review['user_id'])})
            review['user_email'] = user['email'] if user else 'Unknown User'
        return jsonify(reviews)
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'text' not in data or 'rating' not in data:
            return jsonify({'error': 'Review text and rating are required'}), 400
        
        rating = int(data['rating'])
        if not 1 <= rating <= 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        user_id = verify_token()
        review = {
            'text': data['text'],
            'rating': rating,
            'book_id': book_id,
            'user_id': user_id,
            'created_at': datetime.utcnow()
        }
        
        try:
            result = reviews_collection.insert_one(review)
            review['_id'] = str(result.inserted_id)
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            review['user_email'] = user['email'] if user else 'Unknown User'
            return jsonify(review), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/books/<book_id>', methods=['GET'])
@auth_required
def get_book(book_id):
    try:
        book = books_collection.find_one({'_id': ObjectId(book_id)})
        if not book:
            return jsonify({'error': 'Book not found'}), 404
        book['_id'] = str(book['_id'])
        # Get reviews for the book
        reviews = list(reviews_collection.find({'book_id': book_id}))
        for review in reviews:
            review['_id'] = str(review['_id'])
            user = users_collection.find_one({'_id': ObjectId(review['user_id'])})
            review['user_email'] = user['email'] if user else 'Unknown User'
        book['reviews'] = reviews
        return jsonify(book)
    except Exception as e:
        return jsonify({'error': 'Invalid book ID'}), 400
