from flask import Blueprint, request, jsonify
from models import db, User, StaffProfile, Trek, Booking
from helpers import role_required
from werkzeug.security import generate_password_hash
from datetime import date

admin_bp = Blueprint("admin", __name__)

TREK_STATUSES = ["Pending", "Approved", "Open", "Closed", "Started", "Ongoing", "Completed"]


def trek_to_dict(trek):
    staff_name = None
    if trek.assigned_staff_id:
        staff = db.session.get(User, trek.assigned_staff_id)
        if staff:
            staff_name = staff.name
    return {
        "id":                  trek.id,
        "name":                trek.name,
        "location":            trek.location,
        "difficulty":          trek.difficulty,
        "duration_days":       trek.duration_days,
        "start_date":          trek.start_date.isoformat(),
        "total_slots":         trek.total_slots,
        "available_slots":     trek.available_slots,
        "assigned_staff_id":   trek.assigned_staff_id,
        "assigned_staff_name": staff_name,
        "status":              trek.status,
        "price":               trek.price,
        "description":         trek.description
    }


def staff_to_dict(user):
    profile = user.staff_profile
    return {
        "id":               user.id,
        "name":             user.name,
        "email":            user.email,
        "phone":            user.phone,
        "is_active":        user.is_active,
        "designation":      profile.designation if profile else None,
        "experience_years": profile.experience_years if profile else 0
    }


@admin_bp.route("/stats", methods=["GET"])
@role_required("admin")
def get_stats():
    return jsonify({
        "total_treks":    Trek.query.count(),
        "total_users":    User.query.filter_by(role="trekker").count(),
        "total_staff":    User.query.filter_by(role="staff").count(),
        "total_bookings": Booking.query.count()
    }), 200


@admin_bp.route("/treks", methods=["GET"])
@role_required("admin")
def list_treks():
    treks = Trek.query.order_by(Trek.id.desc()).all()
    return jsonify([trek_to_dict(t) for t in treks]), 200


@admin_bp.route("/treks", methods=["POST"])
@role_required("admin")
def create_trek():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    name          = data.get("name", "").strip()
    location      = data.get("location", "").strip()
    difficulty    = data.get("difficulty", "Moderate")
    duration_days = data.get("duration_days")
    start_date_str = data.get("start_date", "")
    total_slots   = data.get("total_slots")
    price         = data.get("price")
    description   = data.get("description", "").strip()
    status        = data.get("status", "Pending")

    if not name:
        return jsonify({"error": "Trek name is required"}), 400
    if not location:
        return jsonify({"error": "Location is required"}), 400
    if difficulty not in ["Easy", "Moderate", "Hard"]:
        return jsonify({"error": "Difficulty must be Easy, Moderate, or Hard"}), 400
    if not duration_days or int(duration_days) < 1:
        return jsonify({"error": "Duration must be at least 1 day"}), 400
    if not start_date_str:
        return jsonify({"error": "Start date is required"}), 400
    if not total_slots or int(total_slots) < 1:
        return jsonify({"error": "Total slots must be at least 1"}), 400
    if price is None or float(price) < 0:
        return jsonify({"error": "Price must be 0 or more"}), 400
    if status not in TREK_STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    try:
        start_date = date.fromisoformat(start_date_str)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    trek = Trek(
        name            = name,
        location        = location,
        difficulty      = difficulty,
        duration_days   = int(duration_days),
        start_date      = start_date,
        total_slots     = int(total_slots),
        available_slots = int(total_slots),
        status          = status,
        price           = float(price),
        description     = description or None
    )
    db.session.add(trek)
    db.session.commit()
    return jsonify({"message": "Trek created successfully", "id": trek.id}), 201


@admin_bp.route("/treks/<int:trek_id>", methods=["PUT"])
@role_required("admin")
def update_trek(trek_id):
    trek = db.session.get(Trek, trek_id)
    if not trek:
        return jsonify({"error": "Trek not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "name" in data:
        if not data["name"].strip():
            return jsonify({"error": "Trek name cannot be empty"}), 400
        trek.name = data["name"].strip()

    if "location" in data:
        trek.location = data["location"].strip()

    if "difficulty" in data:
        if data["difficulty"] not in ["Easy", "Moderate", "Hard"]:
            return jsonify({"error": "Difficulty must be Easy, Moderate, or Hard"}), 400
        trek.difficulty = data["difficulty"]

    if "duration_days" in data:
        trek.duration_days = int(data["duration_days"])

    if "start_date" in data:
        try:
            trek.start_date = date.fromisoformat(data["start_date"])
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if "total_slots" in data:
        trek.total_slots = int(data["total_slots"])

    if "status" in data:
        if data["status"] not in TREK_STATUSES:
            return jsonify({"error": "Invalid status"}), 400
        trek.status = data["status"]

    if "price" in data:
        trek.price = float(data["price"])

    if "description" in data:
        trek.description = data["description"] or None

    if "assigned_staff_id" in data:
        staff_id_val = data["assigned_staff_id"]
        if not staff_id_val:
            trek.assigned_staff_id = None
        else:
            staff = db.session.get(User, int(staff_id_val))
            if not staff or staff.role != "staff":
                return jsonify({"error": "Staff member not found"}), 404
            trek.assigned_staff_id = staff.id

    db.session.commit()
    return jsonify({"message": "Trek updated successfully"}), 200


@admin_bp.route("/treks/<int:trek_id>", methods=["DELETE"])
@role_required("admin")
def delete_trek(trek_id):
    trek = db.session.get(Trek, trek_id)
    if not trek:
        return jsonify({"error": "Trek not found"}), 404

    booking_count = Booking.query.filter_by(trek_id=trek_id).count()
    if booking_count > 0:
        return jsonify({"error": f"Cannot delete: this trek has {booking_count} booking(s)"}), 400

    db.session.delete(trek)
    db.session.commit()
    return jsonify({"message": "Trek deleted successfully"}), 200


@admin_bp.route("/treks/<int:trek_id>/assign", methods=["PUT"])
@role_required("admin")
def assign_staff(trek_id):
    trek = db.session.get(Trek, trek_id)
    if not trek:
        return jsonify({"error": "Trek not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    staff_id = data.get("staff_id")
    if not staff_id:
        trek.assigned_staff_id = None
        db.session.commit()
        return jsonify({"message": "Staff unassigned from trek"}), 200

    staff = db.session.get(User, int(staff_id))
    if not staff or staff.role != "staff":
        return jsonify({"error": "Staff member not found"}), 404

    trek.assigned_staff_id = staff.id
    db.session.commit()
    return jsonify({"message": f"Staff '{staff.name}' assigned to trek"}), 200


@admin_bp.route("/staff", methods=["GET"])
@role_required("admin")
def list_staff():
    staff_users = User.query.filter_by(role="staff").order_by(User.id).all()
    return jsonify([staff_to_dict(u) for u in staff_users]), 200


@admin_bp.route("/staff", methods=["POST"])
@role_required("admin")
def create_staff():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    name             = data.get("name", "").strip()
    email            = data.get("email", "").strip().lower()
    password         = data.get("password", "")
    phone            = data.get("phone", "").strip()
    designation      = data.get("designation", "").strip()
    experience_years = data.get("experience_years", 0)

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    new_user = User(
        name          = name,
        email         = email,
        password_hash = generate_password_hash(password),
        role          = "staff",
        is_active     = True,
        phone         = phone or None
    )
    db.session.add(new_user)
    db.session.flush()

    profile = StaffProfile(
        user_id          = new_user.id,
        designation      = designation or None,
        experience_years = int(experience_years)
    )
    db.session.add(profile)
    db.session.commit()
    return jsonify({"message": "Staff created successfully", "id": new_user.id}), 201


@admin_bp.route("/staff/<int:user_id>", methods=["PUT"])
@role_required("admin")
def update_staff(user_id):
    user = db.session.get(User, user_id)
    if not user or user.role != "staff":
        return jsonify({"error": "Staff member not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "phone" in data:
        user.phone = data["phone"].strip() or None

    profile = user.staff_profile
    if profile:
        if "designation" in data:
            profile.designation = data["designation"].strip() or None
        if "experience_years" in data:
            profile.experience_years = int(data["experience_years"])

    db.session.commit()
    return jsonify({"message": "Staff updated successfully"}), 200


@admin_bp.route("/users", methods=["GET"])
@role_required("admin")
def list_users():
    users = User.query.filter(User.role != "admin").order_by(User.id).all()
    result = []
    for user in users:
        result.append({
            "id":        user.id,
            "name":      user.name,
            "email":     user.email,
            "role":      user.role,
            "is_active": user.is_active,
            "phone":     user.phone
        })
    return jsonify(result), 200


@admin_bp.route("/users/<int:user_id>/toggle-active", methods=["PUT"])
@role_required("admin")
def toggle_active(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role == "admin":
        return jsonify({"error": "Cannot deactivate admin accounts"}), 400

    user.is_active = not user.is_active
    db.session.commit()
    status = "activated" if user.is_active else "deactivated"
    return jsonify({"message": f"User {status} successfully", "is_active": user.is_active}), 200


@admin_bp.route("/search", methods=["GET"])
@role_required("admin")
def search():
    q           = request.args.get("q", "").strip()
    search_type = request.args.get("type", "treks")

    if not q:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    result = []

    if search_type == "treks":
        treks = Trek.query.filter(Trek.name.ilike(f"%{q}%")).all()
        for trek in treks:
            result.append({"id": trek.id, "name": trek.name, "location": trek.location, "status": trek.status, "difficulty": trek.difficulty})

    elif search_type == "staff":
        users = User.query.filter(User.role == "staff", User.name.ilike(f"%{q}%")).all()
        for user in users:
            result.append({"id": user.id, "name": user.name, "email": user.email, "is_active": user.is_active})

    elif search_type == "users":
        users = User.query.filter(User.role == "trekker", User.name.ilike(f"%{q}%")).all()
        for user in users:
            result.append({"id": user.id, "name": user.name, "email": user.email, "is_active": user.is_active})

    else:
        return jsonify({"error": "type must be treks, staff, or users"}), 400

    return jsonify(result), 200


@admin_bp.route("/bookings", methods=["GET"])
@role_required("admin")
def list_bookings():
    bookings = Booking.query.order_by(Booking.id.desc()).all()
    result = []
    for b in bookings:
        result.append({
            "id":             b.id,
            "user_name":      b.trekker.name  if b.trekker else "Unknown",
            "user_email":     b.trekker.email if b.trekker else "",
            "trek_name":      b.trek.name     if b.trek    else "Unknown",
            "booking_date":   b.booking_date.isoformat(),
            "booking_status": b.booking_status,
            "payment_status": b.payment_status
        })
    return jsonify(result), 200


@admin_bp.route("/statistics", methods=["GET"])
@role_required("admin")
def get_statistics():
    treks_by_status = {}
    for status in TREK_STATUSES:
        treks_by_status[status] = Trek.query.filter_by(status=status).count()

    bookings_by_status = {}
    for status in ["Booked", "Cancelled", "Completed"]:
        bookings_by_status[status] = Booking.query.filter_by(booking_status=status).count()

    treks = Trek.query.all()
    bookings_per_trek = []
    for trek in treks:
        count = Booking.query.filter_by(trek_id=trek.id).count()
        bookings_per_trek.append({"trek_name": trek.name, "count": count})
    bookings_per_trek.sort(key=lambda x: x["count"], reverse=True)

    return jsonify({
        "treks_by_status":    treks_by_status,
        "bookings_by_status": bookings_by_status,
        "bookings_per_trek":  bookings_per_trek[:10]
    }), 200
