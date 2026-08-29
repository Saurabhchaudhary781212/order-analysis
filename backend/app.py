from routes.analyze_routes import analyze_bp
from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp


app = Flask(__name__)


# =====================================================
# CORS
# =====================================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://order-analysis-one.vercel.app"
            ],
            "methods": [
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            ],
            "allow_headers": [
                "Content-Type",
                "Authorization"
            ],
            "supports_credentials": True
        }
    }
)


# =====================================================
# REGISTER BLUEPRINT
# =====================================================

app.register_blueprint(auth_bp)
app.register_blueprint(analyze_bp)

# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():

    return {
        "success": True,
        "message": "Order Analytics API is running"
    }


# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )