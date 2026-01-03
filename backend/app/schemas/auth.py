from pydantic import BaseModel


class LoginRequest(BaseModel):
    login_id: str
    password: str
