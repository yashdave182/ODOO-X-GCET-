from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
import enum

class UserRole(enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)

    password_hash = Column(String, nullable=False)

    role = Column(Enum(UserRole), nullable=False)

    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    job_title = Column(String, nullable=True)
    salary = Column(Integer, nullable=True)
