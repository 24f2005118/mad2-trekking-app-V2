from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db, User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    name     = data.get("name",     "").strip()
    email    = data.get("email",    "").strip().lower()
    password = data.get("password", "")
    phone    = data.get("phone",    "").strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not email:
        return jsonify({"error": "Email is required"}), 400

    at_index = email.find("@")
    if at_index == -1 or "." not in email[at_index:]:
        return jsonify({"error": "Invalid email format"}), 400

    if not password:
        return jsonify({"error": "Password is required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        name          = name,
        email         = email,
        password_hash = hashed_password,
        role          = "trekker",
        is_active     = True,
        phone         = phone if phone else None
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Account created successfully. Please log in.",
        "email":   new_user.email
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    email    = data.get("email",    "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Invalid email or password"}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Your account has been deactivated. Contact the admin."}), 403

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": access_token,
        "role":  user.role,
        "name":  user.name,
        "email": user.email
    }), 200
