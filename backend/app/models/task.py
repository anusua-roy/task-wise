import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
from app.core.enums import TaskStatus


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)

    due_date = Column(DateTime)
    status = Column(String, default=TaskStatus.NEW.value)

    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime)

    project = relationship("Project", back_populates="tasks")

    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_tasks",
    )

    assignees = relationship(
        "TaskAssignee",
        back_populates="task",
        cascade="all, delete-orphan",
    )


class TaskAssignee(Base):
    __tablename__ = "task_assignees"

    task_id = Column(String, ForeignKey("tasks.id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)

    task = relationship("Task", back_populates="assignees")
    user = relationship("User")