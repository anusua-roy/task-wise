from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import get_current_user
from app.core.enums import TaskStatus
from app.api.deps import get_db

# NEW
from app.services.auth_service import (
    can_create_task,
    can_modify_task,
    can_update_task_status,
    is_read_only,
)

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


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
        raise HTTPException(status_code=400, detail="project_id is required")

    # ROLE CHECK
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
            raise HTTPException(status_code=403, detail="Not a project member")

    # Validate status
    status = payload.get("status", TaskStatus.NEW.value)

    if status not in [s.value for s in TaskStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")

    # Handle assignees
    assignee_ids = payload.get("assignees", [])

    if assignee_ids:
        users = db.query(User).filter(User.id.in_(assignee_ids)).all()

        if len(users) != len(assignee_ids):
            raise HTTPException(status_code=404, detail="Invalid users")

        # Ensure assignees are project members
        existing_members = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id.in_(assignee_ids),
            )
            .all()
        )

        existing_ids = {m.user_id for m in existing_members}

        for user_id in assignee_ids:
            if user_id not in existing_ids:
                db.add(
                    ProjectMember(
                        project_id=project_id,
                        user_id=user_id,
                        role="Member",
                    )
                )

    task = Task(
        title=payload["title"],
        description=payload.get("description"),
        due_date=payload.get("due_date"),
        status=status,
        project_id=project_id,
        created_by_id=current_user.id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    for user_id in assignee_ids:
        db.add(TaskAssignee(task_id=task.id, user_id=user_id))

    db.commit()

    return task


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
        raise HTTPException(status_code=404, detail="Task not found")

    # READ-ONLY USER LOGIC
    if is_read_only(current_user):
        if "status" not in payload or payload["status"] != TaskStatus.COMPLETED.value:
            raise HTTPException(
                status_code=403,
                detail="Read-only user can only mark task as completed",
            )

        can_update_task_status(current_user, task)
        task.status = TaskStatus.COMPLETED.value
        db.commit()
        db.refresh(task)
        return task

    # NORMAL AUTH
    can_modify_task(current_user, task)

    if "title" in payload:
        task.title = payload["title"]

    if "description" in payload:
        task.description = payload["description"]

    if "status" in payload:
        if payload["status"] not in [s.value for s in TaskStatus]:
            raise HTTPException(status_code=400, detail="Invalid status")

        task.status = payload["status"]

    db.commit()

    # Update assignees
    if "assignees" in payload:
        db.query(TaskAssignee).filter(TaskAssignee.task_id == task_id).delete()

        for user_id in payload["assignees"]:
            db.add(TaskAssignee(task_id=task_id, user_id=user_id))

        db.commit()

    db.refresh(task)

    return task


# ==========================================================
# MY TASKS
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
        raise HTTPException(status_code=404, detail="Task not found")

    # STRICT AUTH (not just membership anymore)
    can_modify_task(current_user, task)

    db.query(TaskAssignee).filter(TaskAssignee.task_id == task_id).delete()
    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
