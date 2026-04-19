from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import CreateProjectRequest
from app.models.project_member import ProjectMember
from app.models.task import Task, TaskAssignee
from app.models.user import User
from app.core.security import get_current_user
from app.api.deps import get_db

from app.services.auth_service import (
    can_view_project,
    can_modify_project,
    can_create_task,
)

from app.core.enums import TaskStatus

router = APIRouter(prefix="/api/projects", tags=["Projects"])


# =========================
# CREATE PROJECT
# =========================
@router.post("/")
def create_project(
    payload: CreateProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    can_create_task(current_user)

    project = Project(
        name=payload.name,
        description=payload.description,
        created_by_id=current_user.id,
    )

    db.add(project)
    db.flush()

    # Owner
    db.add(
        ProjectMember(
            project_id=project.id,
            user_id=current_user.id,
            role="Owner",
        )
    )

    # Members
    for user_id in payload.member_ids or []:
        if user_id == current_user.id:
            continue

        exists = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project.id, ProjectMember.user_id == user_id
            )
            .first()
        )

        if not exists:
            db.add(ProjectMember(project_id=project.id, user_id=user_id, role="Member"))

    db.commit()
    db.refresh(project)

    return project


# =========================
# LIST PROJECTS
# =========================
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
            .filter(
                (Project.created_by_id == current_user.id)
                | (ProjectMember.user_id == current_user.id)
            )
            .distinct()
            .all()
        )

    project_list = []

    for p in projects:
        creator = db.query(User).filter(User.id == p.created_by_id).first()

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
                    }
                    if creator
                    else None
                ),
                "members": formatted_members,
                "created_at": p.created_at,
            }
        )

    return project_list


# =========================
# PROJECT DETAIL (FIXED)
# =========================
@router.get("/{project_id}")
def get_project_detail(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(404, "Project not found")

    membership = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
        )
        .first()
    )

    can_view_project(current_user, project, membership)

    # MEMBERS ADDED
    members = (
        db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
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
                    "role": m.role,
                }
            )

    tasks = db.query(Task).filter(Task.project_id == project_id).all()

    formatted_tasks = []

    for task in tasks:
        assignees = db.query(TaskAssignee).filter(TaskAssignee.task_id == task.id).all()

        formatted_tasks.append(
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "assignees": [
                    {
                        "id": a.user_id,
                    }
                    for a in assignees
                ],
            }
        )

    creator = db.query(User).filter(User.id == project.created_by_id).first()

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_by": (
            {
                "id": creator.id,
                "name": creator.name,
                "email": creator.email,
            }
            if creator
            else None
        ),
        "members": formatted_members,
        "tasks": formatted_tasks,
        "created_at": project.created_at,
    }


# =========================
# DELETE PROJECT
# =========================
@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(404, "Project not found")

    membership = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
        )
        .first()
    )

    can_modify_project(current_user, project, membership)

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}


# =========================
# REMOVE MEMBER (FIXED STATUS)
# =========================
@router.delete("/{project_id}/members/{user_id}")
def remove_member(
    project_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(404, "Project not found")

    if user_id == project.created_by_id:
        raise HTTPException(400, "Cannot remove owner")

    active_tasks = (
        db.query(Task)
        .join(TaskAssignee)
        .filter(
            Task.project_id == project_id,
            TaskAssignee.user_id == user_id,
            Task.status != TaskStatus.DONE.value,
        )
        .all()
    )

    if active_tasks:
        raise HTTPException(400, "User has active tasks")

    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id, ProjectMember.user_id == user_id
        )
        .first()
    )

    db.delete(member)
    db.commit()

    return {"message": "Member removed"}
