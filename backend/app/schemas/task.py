from pydantic import BaseModel
from app.core.enums import TaskStatus
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    status: TaskStatus = TaskStatus.NEW


class TaskRead(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: TaskStatus

    class Config:
        orm_mode = True
