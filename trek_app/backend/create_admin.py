from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

ADMIN_NAME     = "admin"
ADMIN_EMAIL    = "admin@trekapp.com"
ADMIN_PASSWORD = "admin"
ADMIN_PHONE    = "9999999999"


def create_tables(app):
    with app.app_context():
        db.create_all()
        print("All tables created (or already exist).")


def create_admin_user(app):
    with app.app_context():
        existing_admin = User.query.filter_by(role="admin").first()

        if existing_admin:
            print(f"Admin already exists: {existing_admin.email} — skipping creation.")
            return

        hashed_password = generate_password_hash(ADMIN_PASSWORD)

        admin_user = User(
            name          = ADMIN_NAME,
            email         = ADMIN_EMAIL,
            password_hash = hashed_password,
            role          = "admin",
            is_active     = True,
            phone         = ADMIN_PHONE
        )

        db.session.add(admin_user)
        db.session.commit()

        print(f"Admin user created successfully!")
        print(f"  Email   : {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print(f"  Role    : admin")


if __name__ == "__main__":
    app = create_app()

    create_tables(app)

    create_admin_user(app)
