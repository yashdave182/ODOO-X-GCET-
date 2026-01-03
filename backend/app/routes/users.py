from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.user import (
    UserProfileResponse,
    UserProfileUpdate,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.get(
    "/me",
    response_model=UserProfileResponse,
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.put(
    "/me",
    response_model=UserProfileResponse,
)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.phone is not None:
        current_user.phone = payload.phone

    if payload.address is not None:
        current_user.address = payload.address

    db.commit()
    db.refresh(current_user)

    return current_user
