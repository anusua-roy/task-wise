from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.role import Role
from app.core.security import require_role
from app.api.deps import get_db

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get("/")
def list_roles(db: Session = Depends(get_db), user=Depends(require_role("Admin"))):
    return db.query(Role).all()
