from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date

from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    session_date = Column(Date, default=date.today, nullable=False)

    check_in_time = Column(DateTime, nullable=False)
    check_out_time = Column(DateTime, nullable=True)

    user = relationship("User")
