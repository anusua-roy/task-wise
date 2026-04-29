from datetime import datetime

from pydantic import BaseModel
from typing import Optional


class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    member_ids: list[str] = []
    start_date: datetime
    end_date: datetime


class UpdateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
