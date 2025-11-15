from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

# Base class for all models
Base = declarative_base()

class Role(Base):
    """
    Lookup table for User roles (Admin, Task Creator, Read-Only User).
    """
    __tablename__ = 'roles'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    # Relationship to User (one role has many users)
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(name='{self.name}')>"

class User(Base):
    """
    Stores user authentication and profile data.
    """
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    # Storing hashed password (required for non-SSO users or if password reset needed)
    # For SSO-only, this may be omitted or used for internal tokens.
    hashed_password = Column(String, nullable=False) 
    
    # Foreign key relationship to Role
    role_id = Column(UUID(as_uuid=True), ForeignKey('roles.id'), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    role = relationship("Role", back_populates="users")
    projects_owned = relationship("Project", back_populates="owner", foreign_keys='Project.owner_id')
    tasks_assigned = relationship("Task", back_populates="owner", foreign_keys='Task.owner_id')
    tasks_created = relationship("Task", back_populates="created_by", foreign_keys='Task.created_by_id')
    
    # Placeholder for many-to-many relationship with projects (Project Members)
    memberships = relationship("ProjectMember", back_populates="user")


    def __repr__(self):
        return f"<User(email='{self.email}', role='{self.role.name if self.role else 'N/A'}')>"

# The remaining models (Project, Task, ProjectMember) will be added next.

class Project(Base):
    """
    Stores project details.
    """
    __tablename__ = 'projects'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Relationship: Project Owner
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="projects_owned", foreign_keys=[owner_id])
    tasks = relationship("Task", back_populates="project")
    members = relationship("ProjectMember", back_populates="project")

    def __repr__(self):
        return f"<Project(name='{self.name}')>"

class ProjectMember(Base):
    """
    Association table for the Many-to-Many relationship between Users and Projects.
    """
    __tablename__ = 'project_members'

    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")

    def __repr__(self):
        return f"<ProjectMember(project_id='{self.project_id}', user_id='{self.user_id}')>"


class Task(Base):
    """
    Stores individual task details.
    """
    __tablename__ = 'tasks'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(String, nullable=False) # e.g., 'New', 'In-Progress', 'Completed'
    
    # Task Owner (Assigned User)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    # Task Creator
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    owner = relationship("User", back_populates="tasks_assigned", foreign_keys=[owner_id])
    created_by = relationship("User", back_populates="tasks_created", foreign_keys=[created_by_id])

    def __repr__(self):
        return f"<Task(description='{self.description[:20]}...', status='{self.status}')>"