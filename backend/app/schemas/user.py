from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role_id: str


class UserCreate(UserBase):
    pass


from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RoleRead(BaseModel):
    name: str

    model_config = {"from_attributes": True}


class UserRead(BaseModel):
    id: str
    email: EmailStr
    name: str
    created_at: Optional[datetime]
    role: RoleRead

    model_config = {"from_attributes": True}
