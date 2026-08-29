# from flask import Blueprint, request, jsonify


# auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")



# @auth_bp.route(
#     "/register",
#     methods=["POST"]
# )

# def register():

#     data = request.get_json()

#     if not data:

#         return jsonify({
#             "success": False,
#             "message": "No data received"
#         }), 400


#     name = data.get("name")
#     email = data.get("email")
#     password = data.get("password")


#     if not name or not email or not password:

#         return jsonify({
#             "success": False,
#             "message": "Name, email and password are required"
#         }), 400


#     return jsonify({
#         "success": True,
#         "message": "Registration request received",
#         "user": {
#             "name": name,
#             "email": email
#         }
#     }), 201


# # =====================================================
# # LOGIN
# # =====================================================

# @auth_bp.route(
#     "/login",
#     methods=["POST"]
# )
# def login():

#     data = request.get_json()

#     if not data:

#         return jsonify({
#             "success": False,
#             "message": "No data received"
#         }), 400


#     email = data.get("email")
#     password = data.get("password")


#     if not email or not password:

#         return jsonify({
#             "success": False,
#             "message": "Email and password are required"
#         }), 400


#     # -------------------------------------------------
#     # IMPORTANT
#     # -------------------------------------------------
#     # Put your existing login/database/JWT logic here.
#     # -------------------------------------------------

#     return jsonify({
#         "success": True,
#         "message": "Login request received",
#         "token": "JWT_SECRET_KEY",
#         "user": {
#             "email": email
#         }
#     }), 200
from flask import Blueprint, request, jsonify


# =====================================================
# AUTH BLUEPRINT
# =====================================================

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# =====================================================
# REGISTER
# =====================================================

@auth_bp.route(
    "/register",
    methods=["POST"]
)
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required"
        }), 400

    return jsonify({
        "success": True,
        "message": "Registration request received",
        "user": {
            "name": name,
            "email": email
        }
    }), 201


# =====================================================
# LOGIN
# =====================================================

@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    return jsonify({
        "success": True,
        "message": "Login request received",
        "token": "JWT_SECRET_KEY",
        "user": {
            "email": email
        }
    }), 200