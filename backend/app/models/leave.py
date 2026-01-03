from sqlalchemy import Column, Integer, Date, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date
import enum

from app.database import Base


class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String, nullable=True)

    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING)

    user = relationship("User")
