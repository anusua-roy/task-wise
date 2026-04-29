from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.project import Project
from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import get_current_user
from app.core.enums import TaskStatus
from app.api.deps import get_db

from app.services.auth_service import (
    can_create_task,
    can_modify_task,
)

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# ==========================================================
# HELPER: PARSE DATE SAFELY
# ==========================================================
def parse_due_date(raw_due_date: str | None):
    if not raw_due_date:
        return None
    try:
        parsed = datetime.fromisoformat(raw_due_date)
        return parsed  # change to parsed.date() if DB uses Date
    except Exception:
        raise HTTPException(400, "Invalid due_date format")


# ==========================================================
# CREATE TASK
# ==========================================================
@router.post("/")
def create_task(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project_id = payload.get("project_id")

    if not project_id:
        raise HTTPException(400, "project_id is required")

    can_create_task(current_user)

    # Ensure user is project member (unless admin)
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
            raise HTTPException(403, "Not a project member")

    # Validate status
    status = payload.get("status", TaskStatus.NEW.value)

    if status not in [s.value for s in TaskStatus]:
        raise HTTPException(400, "Invalid status")

    assignee_ids = payload.get("assignees", [])

    # Validate assignees
    if assignee_ids:
        members = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id.in_(assignee_ids),
            )
            .all()
        )

        member_ids = {m.user_id for m in members}

        for user_id in assignee_ids:
            if user_id not in member_ids:
                raise HTTPException(400, "Assignee must be a project member")

    # Fetch project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # Parse + validate due_date
    due_date = parse_due_date(payload.get("due_date"))

    if due_date and project.start_date and project.end_date:
        if due_date < project.start_date or due_date > project.end_date:
            raise HTTPException(400, "Due date must be within project timeline")

    # Create task
    task = Task(
        title=payload["title"],
        description=payload.get("description"),
        due_date=due_date,
        status=status,
        project_id=project_id,
        created_by_id=current_user.id,
    )

    db.add(task)
    db.flush()  # better than early commit

    # Add assignees
    for user_id in assignee_ids:
        db.add(TaskAssignee(task_id=task.id, user_id=user_id))

    db.commit()
    db.refresh(task)


# ==========================================================
# UPDATE TASK
# ==========================================================
@router.put("/{task_id}")
def update_task(
    task_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(404, "Task not found")

    # READ-ONLY USER
    if current_user.role.name == "Read-Only":
        assignment = (
            db.query(TaskAssignee)
            .filter(
                TaskAssignee.task_id == task_id,
                TaskAssignee.user_id == current_user.id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(403, "You can only update your assigned tasks")

        if payload.get("status") != TaskStatus.DONE.value:
            raise HTTPException(403, "Read-only user can only mark task as DONE")

        task.status = TaskStatus.DONE.value
        db.commit()
        db.refresh(task)
        return task

    # ADMIN / CREATOR
    can_modify_task(current_user, task)

    if "title" in payload:
        task.title = payload["title"]

    if "description" in payload:
        task.description = payload["description"]

    if "status" in payload:
        if payload["status"] not in [s.value for s in TaskStatus]:
            raise HTTPException(400, "Invalid status")
        task.status = payload["status"]

    # =========================
    # DUE DATE UPDATE (FIXED)
    # =========================
    if "due_date" in payload:
        project = db.query(Project).filter(Project.id == task.project_id).first()

        if not project:
            raise HTTPException(404, "Project not found")

        raw_due_date = payload.get("due_date")

        # Parse
        if raw_due_date:
            try:
                due_date = datetime.fromisoformat(raw_due_date)
            except Exception:
                raise HTTPException(400, "Invalid due_date format")
        else:
            due_date = None

        # Validate ONLY if all values exist
        if due_date and project.start_date and project.end_date:
            if due_date < project.start_date or due_date > project.end_date:
                raise HTTPException(
                    400,
                    "Due date must be within project timeline",
                )

        task.due_date = due_date

    # =========================
    # UPDATE ASSIGNEES
    # =========================
    if payload.get("assignees") is not None:
        assignee_ids = payload["assignees"]

        members = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == task.project_id,
                ProjectMember.user_id.in_(assignee_ids),
            )
            .all()
        )

        member_ids = {m.user_id for m in members}

        for user_id in assignee_ids:
            if user_id not in member_ids:
                raise HTTPException(400, "Assignee must be project member")

        db.query(TaskAssignee).filter(TaskAssignee.task_id == task_id).delete()

        for user_id in assignee_ids:
            db.add(TaskAssignee(task_id=task_id, user_id=user_id))

    db.commit()
    db.refresh(task)

    return task


# ==========================================================
# GET MY TASKS
# ==========================================================
@router.get("/my")
def get_my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = (
        db.query(Task)
        .join(TaskAssignee)
        .filter(TaskAssignee.user_id == current_user.id)
        .all()
    )

    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "project_id": t.project_id,
            "due_date": t.due_date,
        }
        for t in tasks
    ]


# ==========================================================
# DELETE TASK
# ==========================================================
@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(404, "Task not found")

    can_modify_task(current_user, task)

    db.query(TaskAssignee).filter(TaskAssignee.task_id == task_id).delete()
    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
