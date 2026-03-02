from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import get_current_user
from app.core.enums import TaskStatus

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================================
# CREATE TASK
# ==========================================================
@router.post("/")
def create_task(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate status
    if payload.get("status") not in [s.value for s in TaskStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")

    project_id = payload["project_id"]

    # Check user is project member (or Admin)
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

    task = Task(
        title=payload["title"],
        description=payload.get("description"),
        due_date=payload.get("due_date"),
        status=payload.get("status", TaskStatus.NEW.value),
        project_id=project_id,
        created_by_id=current_user.id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    # Assign users if provided
    assignee_ids = payload.get("assignees", [])

    for user_id in assignee_ids:
        # Ensure assignee is project member
        member = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id,
            )
            .first()
        )
        if not member:
            raise HTTPException(
                status_code=400,
                detail=f"User {user_id} is not a project member",
            )

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

    # Update allowed fields
    if "title" in payload:
        task.title = payload["title"]

    if "description" in payload:
        task.description = payload["description"]

    if "status" in payload:
        if payload["status"] not in [s.value for s in TaskStatus]:
            raise HTTPException(status_code=400, detail="Invalid status")
        task.status = payload["status"]

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
