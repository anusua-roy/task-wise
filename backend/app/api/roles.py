from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.role import Role
from app.core.security import require_role

router = APIRouter(prefix="/api/roles", tags=["Roles"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_roles(db: Session = Depends(get_db), user=Depends(require_role("Admin"))):
    return db.query(Role).all()
