from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.models.project import Project
from app.schemas.project import CreateProjectRequest, UpdateProjectRequest
from app.models.project_member import ProjectMember
from app.models.task import Task, TaskAssignee
from app.models.user import User
from app.core.security import get_current_user
from app.api.deps import get_db

router = APIRouter(prefix="/api/projects", tags=["Projects"])


# ==========================================================
# CREATE PROJECT
# ==========================================================
@router.post("/")
def create_project(
    payload: CreateProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=payload.name,
        description=payload.description,
        created_by_id=current_user.id,
    )

    db.add(project)
    db.flush()  # get project.id without committing

    db.add(
        ProjectMember(
            project_id=project.id,
            user_id=current_user.id,
            role="Owner",
        )
    )

    db.commit()
    db.refresh(project)

    return project

# ==========================================================
# LIST PROJECTS
# Anyone logged in can view all projects
# ==========================================================
@router.get("/")
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    projects = (
        db.query(Project)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .filter(
            (Project.created_by_id == current_user.id)
            | (
                (ProjectMember.user_id == current_user.id)
                
            )
        )
        .distinct()
        .all()
    )

    project_list = []

    for p in projects:

        creator = db.query(User).filter(User.id == p.created_by_id).first()

        members = (
            db.query(ProjectMember)
            .filter(ProjectMember.project_id == p.id)
            .all()
        )

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
# PROJECT DETAIL
# Anyone logged in can view
# ==========================================================
@router.get("/{project_id}")
def get_project_detail(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = (
        db.query(Project)
        .options(joinedload(Project.tasks))
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = (
        db.query(Task)
        .options(joinedload(Task.assignees).joinedload(TaskAssignee.user))
        .filter(Task.project_id == project_id)
        .all()
    )

    formatted_tasks = []

    for task in tasks:

        creator = db.query(User).filter(User.id == task.created_by_id).first()

        assignees = [
            {
                "id": a.user.id,
                "name": a.user.name,
                "email": a.user.email,
                "role_id": a.user.role_id,
            }
            for a in task.assignees
            if a.user
        ]

        formatted_tasks.append(
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
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
                "assignees": assignees,
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


@router.put("/{project_id}")
def update_project(
    project_id: str,
    payload: UpdateProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if current user is Owner
    membership = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
            ProjectMember.role == "Owner",
        )
        .first()
    )

    if not membership and project.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")

    # Update fields
    project.name = payload.name
    project.description = payload.description

    db.commit()
    db.refresh(project)

    return project