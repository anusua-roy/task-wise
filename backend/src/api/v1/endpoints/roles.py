from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .... import crud, schemas
from ....database import get_db

router = APIRouter()

# Placeholder for RBAC dependency (will be implemented next)
def get_current_admin():
    """Mocks dependency check: User must be Admin."""
    # Injected logic for Azure AD token validation and role check goes here
    # For now, we assume success to test CRUD functionality.
    return True 

@router.post("/", response_model=schemas.Role, status_code=status.HTTP_201_CREATED, tags=["Roles"])
def create_role(
    *,
    db: Session = Depends(get_db),
    role_in: schemas.RoleCreate,
    is_admin: bool = Depends(get_current_admin)
):
    """
    Create a new role. (Access: Admin)
    """
    role = crud.role.get_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role with this name already exists."
        )
    return crud.role.create(db, obj_in=role_in)

@router.get("/", response_model=List[schemas.Role], tags=["Roles"])
def read_roles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    is_admin: bool = Depends(get_current_admin)
):
    """
    Retrieve all roles. (Access: Admin)
    """
    roles = crud.role.get_multi(db, skip=skip, limit=limit)
    # Add users_count for presentation purposes (optional)
    for role_item in roles:
        role_item.users_count = len(role_item.users)
    return roles

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Roles"])
def delete_role(
    role_id: str,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_current_admin)
):
    """
    Delete a role by ID. (Access: Admin)
    """
    role = crud.role.remove(db, id=role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found.")
    return None