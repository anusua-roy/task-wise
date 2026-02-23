from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserRead
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/users", tags=["Users"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Admin only
@router.post("/", response_model=UserRead)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("Admin")),
):
    role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    new_user = User(email=payload.email, name=payload.name, role_id=payload.role_id)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# Admin only
@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db), user=Depends(require_role("Admin"))):
    return db.query(User).all()


# Admin or Self
@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role.name != "Admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return target
