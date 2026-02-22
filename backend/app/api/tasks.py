from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.task import Task
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import get_current_user, require_role

router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)

VALID_STATUSES = ["New", "In-Progress", "Blocked", "Completed", "Not Started"]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", dependencies=[Depends(require_role("Task Creator"))])
def create_task(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    task = Task(
        description=payload["description"],
        due_date=payload.get("due_date"),
        status=payload["status"],
        project_id=payload["project_id"],
        owner_id=payload["owner_id"],
        created_by_id=current_user.id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.put("/{task_id}")
def update_task(
    task_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Read-only can only mark Completed
    if current_user.role.name == "Read-Only":
        if task.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

        if payload.get("status") != "Completed":
            raise HTTPException(status_code=403, detail="Can only mark completed")

        task.status = "Completed"
    else:
        task.description = payload.get("description", task.description)
        task.status = payload.get("status", task.status)

    db.commit()
    db.refresh(task)

    return task