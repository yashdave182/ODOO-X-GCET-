import secrets
import string

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.core.dependencies import get_current_admin
from app.core.security import get_password_hash
from app.core.utils import generate_login_id
from app.schemas.admin import AdminCreateEmployee

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
