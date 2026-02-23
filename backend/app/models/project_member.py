import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime
from app.db.base import Base


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    user_id = Column(String, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)
