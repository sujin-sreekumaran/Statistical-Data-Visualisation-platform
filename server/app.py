from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from config import Config

load_dotenv()

app = Flask(__name__)
CORS(app)

client = MongoClient(Config.MONGODB_URI)
db = client[Config.MONGODB_DB]

# Check database connection
try:
    db.list_collection_names()
    print("Successfully connected to the database.")
except Exception as e:
    print(f"Failed to connect to the database: {e}")

app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_EXPIRATION_DELTA

from api.auth import auth_bp
from api.upload import upload_bp

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, port=Config.PORT)