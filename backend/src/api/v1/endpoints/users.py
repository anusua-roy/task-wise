from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Union
import uuid

from .... import crud, schemas
from ....database import get_db

router = APIRouter()

# Placeholder for RBAC dependency (Admin and Self Access checks needed here)
def get_current_admin():
    """Mocks dependency check: User must be Admin."""
    return True 

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
    is_admin: bool = Depends(get_current_admin) # Only admin can create users initially
):
    """
    Create a new user. Requires role_id to be supplied. (Access: Admin)
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    # Check if the requested role_id exists
    role = crud.role.get(db, id=user_in.role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role ID not found.")

    return crud.user.create(db, obj_in=user_in)

@router.get("/", response_model=List[schemas.User], tags=["Users"])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    is_admin: bool = Depends(get_current_admin)
):
    """
    Retrieve all users. (Access: Admin)
    """
    return crud.user.get_multi(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=schemas.User, tags=["Users"])
def read_user_by_id(
    user_id: Union[uuid.UUID, str],
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_current_admin) # TODO: Expand to include "Self" access
):
    """
    Get a specific user by ID. (Access: Admin, Self)
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user

@router.put("/{user_id}", response_model=schemas.User, tags=["Users"])
def update_user(
    user_id: Union[uuid.UUID, str],
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_current_admin) # TODO: Expand to include "Self" access
):
    """
    Update user details. (Access: Admin, Self)
    """
    user_obj = crud.user.get(db, id=user_id)
    if not user_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    # Check if a new role is specified and exists
    if user_in.role_id and not crud.role.get(db, id=user_in.role_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role ID not found.")

    return crud.user.update(db, db_obj=user_obj, obj_in=user_in)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
def delete_user(
    user_id: Union[uuid.UUID, str],
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_current_admin)
):
    """
    Delete a user by ID. (Access: Admin)
    """
    user = crud.user.remove(db, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return None