from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, UTC
from config import Config

auth_bp = Blueprint('auth', __name__)

client = MongoClient(Config.MONGODB_URI)
db = client[Config.MONGODB_DB]
users = db.users

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    existing_user = users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    new_user = {
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    result = users.insert_one(new_user)
    user_id = str(result.inserted_id)

    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + Config.JWT_EXPIRATION_DELTA
    }, Config.JWT_SECRET, algorithm='HS256')

    return jsonify({"token": token, "user_id": user_id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.now(UTC) + Config.JWT_EXPIRATION_DELTA
    }, Config.JWT_SECRET, algorithm='HS256')

    return jsonify({"token": token, "user_id": str(user['_id'])}), 200