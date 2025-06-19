from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

from api.upload import upload_bp

app.register_blueprint(upload_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, port=5000)