from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

load_dotenv()

def seed_admin():
    db: Session = SessionLocal()

    try:
        # Check if an admin already exists
        admin_exists = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN)
            .first()
        )

        if admin_exists:
            print("Admin already exists. Skipping seeding.")
            return

        # Read admin details from environment
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")
        admin_employee_id = os.getenv("ADMIN_EMPLOYEE_ID")

        if not all([admin_email, admin_password, admin_employee_id]):
            raise Exception("Admin credentials not set in .env")

        # Create admin user
        admin_user = User(
            employee_id=admin_employee_id,
            name="System Admin",
            email=admin_email,
            password_hash=get_password_hash(admin_password),
            role=UserRole.ADMIN,
        )

        db.add(admin_user)
        db.commit()

        print("Admin user created successfully.")
        print("Seeded admin ID:", admin.employee_id)

    finally:
        db.close()
