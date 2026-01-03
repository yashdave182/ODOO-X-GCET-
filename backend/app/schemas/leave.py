from pydantic import BaseModel
from datetime import date


class LeaveApplyRequest(BaseModel):
    start_date: date
    end_date: date
    reason: str | None = None
