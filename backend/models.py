# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(300), unique=True, index=True, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="assignee")

class Project(Base):
    __tablename__ = "project"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    description = Column(Text, default="")
    tags = Column(String(500), default="")  # comma-separated
    repo_url = Column(String(500), default="")
    live_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    tasks = relationship("Task", back_populates="project")

class Task(Base):
    __tablename__ = "task"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="todo")  # todo|in-progress|blocked|done
    tags = Column(String(500), default="")
    assignee_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    assignee = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
