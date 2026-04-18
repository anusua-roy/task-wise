from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.role import Role
from app.models.user import User
from app.core.security import get_current_user
from app.services.auth_service import is_admin

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get("/")
def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ADMIN CHECK
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    roles = db.query(Role).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
        }
        for r in roles
    ]
