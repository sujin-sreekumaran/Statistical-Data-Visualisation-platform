from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from config import Config

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)

# MongoDB configuration
client = MongoClient(Config.MONGODB_URI)
db = client[Config.MONGODB_DB]

# Check database connection
try:
    # Attempt to list collections to check the connection
    db.list_collection_names()
    print("Successfully connected to the database.")
except Exception as e:
    print(f"Failed to connect to the database: {e}")

# JWT configuration
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_EXPIRATION_DELTA

# Import and register blueprints
from api.auth import auth_bp
from api.upload import upload_bp

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, port=Config.PORT)