from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
import uuid

# --- Base Schemas (Shared Properties) ---

class DateTimeBase(BaseModel):
    """Base schema for models with standard timestamp fields."""
    created_at: datetime
    updated_at: datetime

    class Config:
        # Allows conversion from ORM model instances
        from_attributes = True

# --- Role Schemas ---

class RoleBase(BaseModel):
    """Base schema for creating or updating a Role."""
    name: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=255)

class RoleCreate(RoleBase):
    """Schema for creating a new Role."""
    pass

class Role(RoleBase, DateTimeBase):
    """Schema for returning a Role (includes UUID and timestamps)."""
    id: uuid.UUID
    
    # Nested field to show the count of users (optional)
    users_count: Optional[int] = 0

# --- User Schemas ---

class UserBase(BaseModel):
    """Base schema for creating or updating a User."""
    email: EmailStr = Field(..., description="Unique email address for the user.")
    name: str = Field(..., max_length=100)
    # Note: role_id is handled in UserCreate/UserUpdate

class UserCreate(UserBase):
    """Schema for creating a new User (requires a password and role_id)."""
    password: str = Field(..., min_length=8)
    # The role_id is mandatory during creation
    role_id: uuid.UUID

class UserUpdate(UserBase):
    """Schema for updating a User (all fields optional)."""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role_id: Optional[uuid.UUID] = None

class User(UserBase, DateTimeBase):
    """Schema for returning a User (hides the hashed password)."""
    id: uuid.UUID
    role_id: uuid.UUID
    
    # Relationship fields (returns the role details, not just the ID)
    role: Role

    class Config(DateTimeBase.Config):
        # Allow nested models to be serialized correctly
        pass

# --- Project Schemas (Initial definition) ---

class ProjectBase(BaseModel):
    name: str = Field(..., max_length=150)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    # Owner ID will be set by the API based on the authenticated user
    pass

class Project(ProjectBase, DateTimeBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    owner: User  # Nested user schema for owner details
    
    # Placeholder for members and tasks
    members_count: int = 0
    tasks_count: int = 0

# --- Task Schemas (Initial definition) ---

class TaskBase(BaseModel):
    description: str = Field(..., max_length=500)
    due_date: Optional[datetime] = None
    # Status validation will be enforced in the service layer, but schema uses a string
    status: str = Field('New', description="Status: New, In-progress, Blocked, Completed, Not started")
    
class TaskCreate(TaskBase):
    project_id: uuid.UUID
    # owner_id (assignee) is required on creation
    owner_id: uuid.UUID 

class Task(TaskBase, DateTimeBase):
    id: uuid.UUID
    project_id: uuid.UUID
    owner_id: uuid.UUID
    created_by_id: uuid.UUID
    
    # Nested relationship fields
    owner: User # Assigned user
    created_by: User # Creator