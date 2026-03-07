from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import get_current_user
from app.core.enums import TaskStatus
from app.api.deps import get_db

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

    # Validate status
    status = payload.get("status", TaskStatus.NEW.value)

    if status not in [s.value for s in TaskStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")

    # Ensure user can create task in project
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
            raise HTTPException(
                status_code=403,
                detail="Only project members can create tasks",
            )

    # Extract assignees
    assignee_ids = payload.get("assignees", [])

    # Validate assignee users
    if assignee_ids:
        users = db.query(User).filter(User.id.in_(assignee_ids)).all()

        if len(users) != len(assignee_ids):
            raise HTTPException(status_code=404, detail="One or more users not found")

        # Ensure assigned users become project members
        existing_members = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id.in_(assignee_ids),
            )
            .all()
        )

        existing_member_ids = {m.user_id for m in existing_members}

        for user_id in assignee_ids:
            if user_id not in existing_member_ids:
                db.add(
                    ProjectMember(
                        project_id=project_id,
                        user_id=user_id,
                        role="Member",
                    )
                )

    # Create task
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

    # Insert assignees
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

    # Check membership
    if current_user.role.name != "Admin":
        membership = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == task.project_id,
                ProjectMember.user_id == current_user.id,
            )
            .first()
        )

        if not membership:
            raise HTTPException(status_code=403, detail="Not a project member")

    # Update title
    if "title" in payload:
        task.title = payload["title"]

    # Update description
    if "description" in payload:
        task.description = payload["description"]

    # Update status
    if "status" in payload:
        if payload["status"] not in [s.value for s in TaskStatus]:
            raise HTTPException(status_code=400, detail="Invalid status")

        task.status = payload["status"]

    db.commit()

    # Update assignees
    if "assignees" in payload:

        # remove existing
        db.query(TaskAssignee).filter(TaskAssignee.task_id == task_id).delete()

        # add new
        for user_id in payload["assignees"]:
            db.add(TaskAssignee(task_id=task_id, user_id=user_id))

        db.commit()

    db.refresh(task)

    return task


# ==========================================================
# MY TASKS (Dashboard)
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


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Permission check
    if current_user.role.name != "Admin":
        membership = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == task.project_id,
                ProjectMember.user_id == current_user.id,
            )
            .first()
        )

        if not membership:
            raise HTTPException(status_code=403, detail="Not authorized")

    # Delete assignees
    db.query(TaskAssignee).filter(TaskAssignee.task_id == task_id).delete()

    # Delete task
    db.delete(task)

    db.commit()

    return {"message": "Task deleted successfully"}
