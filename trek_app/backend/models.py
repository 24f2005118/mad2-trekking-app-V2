from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role          = db.Column(db.String(20), nullable=False, default="trekker")
    is_active     = db.Column(db.Boolean, nullable=False, default=True)
    phone         = db.Column(db.String(20), nullable=True)

    bookings       = db.relationship("Booking", backref="trekker", lazy=True)
    staff_profile  = db.relationship("StaffProfile", backref="user", uselist=False, lazy=True)
    assigned_treks = db.relationship("Trek", backref="assigned_staff", lazy=True)

    def __repr__(self):
        return f"<User {self.email} role={self.role}>"


class StaffProfile(db.Model):
    __tablename__ = "staff_profiles"

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    designation      = db.Column(db.String(100), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True, default=0)
    phone            = db.Column(db.String(20), nullable=True)

    def __repr__(self):
        return f"<StaffProfile user_id={self.user_id}>"


class Trek(db.Model):
    __tablename__ = "treks"

    id                = db.Column(db.Integer, primary_key=True)
    name              = db.Column(db.String(150), nullable=False)
    location          = db.Column(db.String(150), nullable=False)
    difficulty        = db.Column(db.String(20), nullable=False, default="Moderate")
    duration_days     = db.Column(db.Integer, nullable=False, default=1)
    start_date        = db.Column(db.Date, nullable=False)
    total_slots       = db.Column(db.Integer, nullable=False, default=10)
    available_slots   = db.Column(db.Integer, nullable=False, default=10)
    assigned_staff_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    status            = db.Column(db.String(20), nullable=False, default="Pending")
    price             = db.Column(db.Float, nullable=False, default=0.0)
    description       = db.Column(db.Text, nullable=True)

    bookings = db.relationship("Booking", backref="trek", lazy=True)

    def __repr__(self):
        return f"<Trek {self.name} status={self.status}>"


class Booking(db.Model):
    __tablename__ = "bookings"

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    trek_id        = db.Column(db.Integer, db.ForeignKey("treks.id"), nullable=False)
    booking_date   = db.Column(db.Date, nullable=False)
    booking_status = db.Column(db.String(20), nullable=False, default="Booked")
    payment_status = db.Column(db.String(20), nullable=False, default="Pending")

    __table_args__ = (
        UniqueConstraint("user_id", "trek_id", name="uq_user_trek"),
    )

    def __repr__(self):
        return f"<Booking user_id={self.user_id} trek_id={self.trek_id} status={self.booking_status}>"
