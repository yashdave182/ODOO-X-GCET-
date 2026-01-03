from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leave import Leave, LeaveStatus
from app.models.user import User
from app.schemas.leave import LeaveApplyRequest
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/leaves",
    tags=["Leaves"],
)

@router.post("/apply")
def apply_leave(
    payload: LeaveApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date",
        )

    leave = Leave(
        user_id=current_user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status=LeaveStatus.PENDING,
    )

    db.add(leave)
    db.commit()

    return {
        "message": "Leave request submitted",
        "status": leave.status,
    }

@router.get("/me")
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    leaves = (
        db.query(Leave)
        .filter(Leave.user_id == current_user.id)
        .order_by(Leave.start_date.desc())
        .all()
    )

    return [
        {
            "id": l.id,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "reason": l.reason,
            "status": l.status,
        }
        for l in leaves
    ]
