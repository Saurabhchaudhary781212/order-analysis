# from flask import Flask, jsonify
# from flask_cors import CORS

# from routes.auth_routes import auth_bp
# from routes.data_routes import data_bp


# app = Flask(__name__)


# # -----------------------------
# # CORS CONFIGURATION
# # -----------------------------

# CORS(
#     app,
#     resources={
#         r"/api/*": {
#             "origins": [
#                 "http://localhost:5173"
#             ]
#         }
#     },
#     methods=[
#         "GET",
#         "POST",
#         "PUT",
#         "DELETE",
#         "OPTIONS"
#     ],
#     allow_headers=[
#         "Content-Type",
#         "Authorization"
#     ]
# )


# # -----------------------------
# # BLUEPRINTS
# # -----------------------------

# # Authentication APIs
# app.register_blueprint(
#     auth_bp,
#     url_prefix="/api/auth"
# )


# # Data upload + analysis APIs
# app.register_blueprint(
#     data_bp,
#     url_prefix="/api/data"
# )


# # -----------------------------
# # HOME ROUTE
# # -----------------------------

# @app.route("/")
# def home():
#     return jsonify({
#         "success": True,
#         "message": "Order Analytics API is running"
#     })


# # -----------------------------
# # RUN SERVER
# # -----------------------------

# if __name__ == "__main__":
#     app.run(
#         host="127.0.0.1",
#         port=5000,
#         debug=True
#     )

from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.data_routes import data_bp


app = Flask(__name__)


CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173"
            ]
        }
    },
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    allow_headers=[
        "Content-Type",
        "Authorization"
    ]
)


app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)


app.register_blueprint(
    data_bp,
    url_prefix="/api/data"
)


@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "Order Analytics API is running"
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )