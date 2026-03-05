from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
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

    project_list = []
    for p in projects:
        # Fetch creator
        creator = db.query(User).filter(User.id == p.created_by_id).first()

        # Fetch members
        members = db.query(ProjectMember).filter(ProjectMember.project_id == p.id).all()

        formatted_members = []
        for m in members:
            user = db.query(User).filter(User.id == m.user_id).first()
            if user:
                formatted_members.append(
                    {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "role_id": user.role_id,
                        "role": m.role,
                    }
                )

        project_list.append(
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "created_by": (
                    {
                        "id": creator.id,
                        "name": creator.name,
                        "email": creator.email,
                        "role_id": creator.role_id,
                    }
                    if creator
                    else None
                ),
                "members": formatted_members,
                "created_at": p.created_at,
            }
        )

    return project_list


# ==========================================================
# PROJECT DETAIL (with tasks only, assignee as user object)
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

    # Fetch tasks
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    formatted_tasks = []
    for task in tasks:
        creator_user = db.query(User).filter(User.id == task.created_by_id).first()
        assignee_user = (
            db.query(User).filter(User.id == task.assignee_id).first()
            if task.assignee_id
            else None
        )

        formatted_tasks.append(
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "created_by": (
                    {
                        "id": creator_user.id,
                        "name": creator_user.name,
                        "email": creator_user.email,
                        "role_id": creator_user.role_id,
                    }
                    if creator_user
                    else None
                ),
                "assignee": (
                    {
                        "id": assignee_user.id,
                        "name": assignee_user.name,
                        "email": assignee_user.email,
                        "role_id": assignee_user.role_id,
                    }
                    if assignee_user
                    else None
                ),
            }
        )

    project_creator = db.query(User).filter(User.id == project.created_by_id).first()

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_by": (
            {
                "id": project_creator.id,
                "name": project_creator.name,
                "email": project_creator.email,
                "role_id": project_creator.role_id,
            }
            if project_creator
            else None
        ),
        "tasks": formatted_tasks,
        "created_at": project.created_at,
    }
