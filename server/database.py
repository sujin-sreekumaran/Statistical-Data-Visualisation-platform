from pymongo.mongo_client import MongoClient
from server.config import Config

uri = Config.MONGODB_URI

client = MongoClient(uri)
db = client[Config.MONGODB_DB]

# Test the connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

def get_db():
    return db
