from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User


def role_required(required_role):
    def decorator(route_function):
        @wraps(route_function)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)

            if user is None:
                return jsonify({"error": "User not found"}), 403

            if not user.is_active:
                return jsonify({"error": "Your account has been deactivated. Contact the admin."}), 403

            if user.role != required_role:
                return jsonify({"error": "Access denied. You do not have permission for this action."}), 403

            return route_function(*args, **kwargs)

        return wrapper
    return decorator
