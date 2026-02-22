from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role_id: str

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}