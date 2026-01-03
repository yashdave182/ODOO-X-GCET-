from pydantic import BaseModel


class AdminCreateEmployee(BaseModel):
    first_name: str
    last_name: str
    year_of_joining: int
    email: str
    phone: str
