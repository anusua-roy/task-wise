from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import require_role, get_current_user

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", dependencies=[Depends(require_role("Task Creator"))])
def create_project(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = Project(
        name=payload["name"],
        description=payload.get("description"),
        start_date=payload.get("start_date"),
        end_date=payload.get("end_date"),
        owner_id=current_user.id
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    # Add owner as project member
    db.add(ProjectMember(project_id=project.id, user_id=current_user.id))
    db.commit()

    return project


@router.get("/")
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name == "Admin":
        return db.query(Project).all()

    member_projects = (
        db.query(Project)
        .join(ProjectMember)
        .filter(ProjectMember.user_id == current_user.id)
        .all()
    )

    return member_projects