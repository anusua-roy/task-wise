from pydantic import BaseModel
from typing import Optional


class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    member_ids: list[str] = []


class UpdateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
