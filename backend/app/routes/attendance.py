from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from app.models.attendance import Attendance
from app.models.user import User
from app.core.dependencies import get_current_user
from typing import Optional
from fastapi import Query

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)

@router.post("/check-in")
def check_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attendance = Attendance(
        user_id=current_user.id,
        session_date=date.today(),
        check_in_time=datetime.utcnow(),
    )

    db.add(attendance)
    db.commit()

    return {"message": "Checked in"}

@router.post("/check-out")
def check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id,
            Attendance.check_out_time.is_(None),
        )
        .order_by(Attendance.check_in_time.desc())
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=400,
            detail="No active session",
        )

    attendance.check_out_time = datetime.utcnow()
    db.commit()

    return {"message": "Checked out"}


@router.get("/me")
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    query = db.query(Attendance).filter(
        Attendance.user_id == current_user.id
    )

    if start_date:
        query = query.filter(Attendance.session_date >= start_date)

    if end_date:
        query = query.filter(Attendance.session_date <= end_date)

    records = query.order_by(Attendance.check_in_time.desc()).all()

    return [
        {
            "id": r.id,
            "date": r.session_date,
            "check_in": r.check_in_time,
            "check_out": r.check_out_time,
        }
        for r in records
    ]