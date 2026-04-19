from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserRead, UserBase, UserLookup
from app.core.security import require_role, get_current_user
from app.api.deps import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])


# ==========================================================
# CREATE USER (Admin only)
# ==========================================================
@router.post("/", response_model=UserRead)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):
    # Validate role (id or name supported)
    role = db.query(Role).filter(Role.id == payload.role_id).first()

    if not role:
        role = db.query(Role).filter(Role.name == payload.role_id).first()

    if not role:
        raise HTTPException(400, "Invalid role")

    # Email uniqueness
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "Email already registered")

    user = User(
        email=payload.email,
        name=payload.name,
        role_id=role.id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ==========================================================
# LIST USERS (Admin only)
# ==========================================================
@router.get("/", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):
    return db.query(User).all()


# ==========================================================
# USER LOOKUP (Used for dropdowns, assignment, etc.)
# ==========================================================
@router.get("/lookup", response_model=list[UserLookup])
def lookup_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # NOTE:
    # This returns minimal info only (safe)
    # Can be scoped to project later if needed
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
        }
        for u in users
    ]


# ==========================================================
# GET USER (Admin or Self)
# ==========================================================
@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    if current_user.role.name != "Admin" and current_user.id != user_id:
        raise HTTPException(403, "Not authorized")

    return user


# ==========================================================
# UPDATE USER (Admin only)
# ==========================================================
@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    payload: UserBase,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("Admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    # Validate role
    role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(400, "Invalid role")

    # Email uniqueness
    if user.email != payload.email:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(400, "Email already registered")

    user.email = payload.email
    user.name = payload.name
    user.role_id = payload.role_id

    db.commit()
    db.refresh(user)

    return user


# ==========================================================
# DELETE USER (Admin only with safety)
# ==========================================================
@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    # Prevent deleting self
    if current_user.id == user_id:
        raise HTTPException(400, "Cannot delete yourself")

    # Prevent deleting last admin
    if user.role.name == "Admin":
        admin_count = db.query(User).join(Role).filter(Role.name == "Admin").count()
        if admin_count <= 1:
            raise HTTPException(400, "At least one admin must exist")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}
