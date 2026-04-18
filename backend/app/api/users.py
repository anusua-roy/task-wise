from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserRead, UserBase
from app.core.security import require_role, get_current_user
from app.api.deps import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])


# ----------------------
# CREATE USER (Admin)
# ----------------------
@router.post("/", response_model=UserRead)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):

    role = db.query(Role).filter(Role.id == payload.role_id).first()

    if not role:
        role = db.query(Role).filter(Role.name == payload.role_id).first()

    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=payload.email,
        name=payload.name,
        role_id=role.id,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ----------------------
# LIST USERS (Admin only)
# ----------------------
@router.get("/", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):
    return db.query(User).all()


# ----------------------
# GET USER BY ID (Admin OR Self)
# ----------------------
@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔥 Access control
    if current_user.role.name != "Admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return user


# ----------------------
# UPDATE USER (Admin)
# ----------------------
@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    payload: UserBase,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.id == payload.role_id).first()

    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Email uniqueness
    if user.email != payload.email:
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

    user.email = payload.email
    user.name = payload.name
    user.role_id = payload.role_id

    db.commit()
    db.refresh(user)

    return user


# ----------------------
# DELETE USER (Admin)
# ----------------------
@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"detail": "User deleted successfully"}
