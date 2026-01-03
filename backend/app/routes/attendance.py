from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from app.models.attendance import Attendance
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)

@router.post("/check-in")
def check_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id,
            Attendance.attendance_date == today,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today",
        )

    attendance = Attendance(
        user_id=current_user.id,
        attendance_date=today,
        check_in_time=datetime.utcnow(),
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Check-in successful",
        "check_in_time": attendance.check_in_time,
    }

@router.post("/check-out")
def check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id,
            Attendance.attendance_date == today,
        )
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have not checked in today",
        )

    if attendance.check_out_time is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today",
        )

    attendance.check_out_time = datetime.utcnow()
    db.commit()

    return {
        "message": "Check-out successful",
        "check_out_time": attendance.check_out_time,
    }

@router.get("/me")
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(Attendance)
        .filter(Attendance.user_id == current_user.id)
        .order_by(Attendance.attendance_date.desc())
        .all()
    )

    return [
        {
            "date": a.attendance_date,
            "check_in": a.check_in_time,
            "check_out": a.check_out_time,
        }
        for a in records
    ]
