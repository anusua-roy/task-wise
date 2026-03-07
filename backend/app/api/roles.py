from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.role import Role

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get("/")
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
        }
        for r in roles
    ]
