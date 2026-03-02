from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task, TaskAssignee
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================================
# CREATE PROJECT
# ==========================================================
@router.post("/")
def create_project(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=payload["name"],
        description=payload.get("description"),
        created_by_id=current_user.id,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    # Add creator as Owner
    db.add(
        ProjectMember(
            project_id=project.id,
            user_id=current_user.id,
            role="Owner",
        )
    )
    db.commit()

    return project


# ==========================================================
# LIST PROJECTS (Dashboard)
# ==========================================================
@router.get("/")
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.name == "Admin":
        projects = db.query(Project).all()
    else:
        projects = (
            db.query(Project)
            .join(ProjectMember)
            .filter(ProjectMember.user_id == current_user.id)
            .all()
        )

    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "created_by_id": p.created_by_id,
            "created_at": p.created_at,
        }
        for p in projects
    ]


# ==========================================================
# PROJECT DETAIL (with tasks + members)
# ==========================================================
@router.get("/{project_id}")
def get_project_detail(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Authorization
    if current_user.role.name != "Admin":
        membership = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == current_user.id,
            )
            .first()
        )
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied")

    # Fetch members
    members = (
        db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    )

    # Fetch tasks
    tasks = db.query(Task).filter(Task.project_id == project_id).all()

    # Format assignees
    formatted_tasks = []
    for task in tasks:
        assignees = db.query(TaskAssignee).filter(TaskAssignee.task_id == task.id).all()

        formatted_tasks.append(
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "created_by_id": task.created_by_id,
                "assignees": [a.user_id for a in assignees],
            }
        )

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_by_id": project.created_by_id,
        "members": [
            {
                "user_id": m.user_id,
                "role": m.role,
            }
            for m in members
        ],
        "tasks": formatted_tasks,
    }
