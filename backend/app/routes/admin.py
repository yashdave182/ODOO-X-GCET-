import secrets
import string

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.core.dependencies import get_current_admin, get_current_user
from app.core.security import get_password_hash
from app.core.utils import generate_login_id
from app.schemas.admin import AdminCreateEmployee
from app.models.leave import Leave, LeaveStatus
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

@router.post("/users")
def create_employee(
    payload: AdminCreateEmployee,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    # count employees for the given year
    year_count = (
        db.query(User)
        .filter(User.employee_id.contains(str(payload.year_of_joining)))
        .count()
        + 1
    )

    login_id = generate_login_id(
        payload.first_name,
        payload.last_name,
        payload.year_of_joining,
        year_count,
    )

    # generate secure temporary password
    temp_password = "".join(
        secrets.choice(string.ascii_letters + string.digits + "@#$")
        for _ in range(10)
    )

    user = User(
        employee_id=login_id,
        name=f"{payload.first_name} {payload.last_name}",
        email=payload.email,
        phone=payload.phone,
        role=UserRole.EMPLOYEE,
        password_hash=get_password_hash(temp_password),
    )

    db.add(user)
    db.commit()

    return {
        "login_id": login_id,
        "temporary_password": temp_password,
    }

@router.get("/users")
def get_all_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "employee_id": user.employee_id,
            "name": user.name,
            "role": user.role.value,
            "email": user.email,
            "job_title": user.job_title,
        }
        for user in users
    ]

@router.get("/leaves")
def get_all_leaves(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    leaves = db.query(Leave).all()

    return [
        {
            "id": l.id,
            "employee_id": l.user.employee_id,
            "name": l.user.name,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "reason": l.reason,
            "status": l.status,
        }
        for l in leaves
    ]

@router.put("/leaves/{leave_id}/approve")
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    leave.status = LeaveStatus.APPROVED
    db.commit()

    return {"message": "Leave approved"}

@router.put("/leaves/{leave_id}/reject")
def reject_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    leave.status = LeaveStatus.REJECTED
    db.commit()

    return {"message": "Leave rejected"}
