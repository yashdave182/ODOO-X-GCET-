from pydantic import BaseModel
from typing import Optional
class UserProfileResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    role: str

    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    salary: Optional[int] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
