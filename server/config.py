import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    JWT_SECRET = os.environ.get('JWT_SECRET')
    MONGODB_URI = os.environ.get('MONGODB_URI')
    MONGODB_DB = os.environ.get('MONGODB_DB')
    JWT_EXPIRATION_DELTA = timedelta(hours=1)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Add this line
    DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')
    PORT = int(os.environ.get('PORT', 5000))


