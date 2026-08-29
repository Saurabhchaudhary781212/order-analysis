from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp

app = Flask(__name__)

CORS(
    app,
    origins=[
        "https://order-analysis-one.vercel.app"
    ],
    supports_credentials=True
)

app.register_blueprint(auth_bp)


@app.route("/")
def home():
    return {
        "success": True,
        "message": "Order Analytics API is running"
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)