from app.core.dependencies import get_current_user
from app.core.security import create_access_token, verify_password
from app.database import get_db
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(
    employee_id: str,
    password: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.employee_id == employee_id).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee ID or password",
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value,
        }
    )

    return {
        "access_token": access_token,
        "role": user.role.value,
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "employee_id": current_user.employee_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
    }
