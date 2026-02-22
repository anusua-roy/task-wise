# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    is_admin: Optional[bool] = False

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    tags: Optional[str] = ""
    repo_url: Optional[str] = ""
    live_url: Optional[str] = ""

class ProjectRead(ProjectCreate):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "todo"
    tags: Optional[str] = ""
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None

class TaskRead(TaskCreate):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
