from pydantic import BaseModel
from typing import Optional


class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None


class UpdateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
