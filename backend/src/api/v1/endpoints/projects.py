from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Union
import uuid

from .... import crud, schemas
from ....schemas import Project, ProjectCreate, ProjectUpdate, TokenPayload
from ....database import get_db
from .auth import get_admin, get_task_creator_or_admin, RoleChecker, ALL_ROLES

router = APIRouter()

# ----------------------------------------------------------------------
# Helper Dependencies for Project Authorization
# ----------------------------------------------------------------------

def get_project_owner_or_admin(project_id: Union[uuid.UUID, str], db: Session = Depends(get_db), current_user: TokenPayload = Depends(get_task_creator_or_admin)):
    """
    Dependency to ensure the current user is an Admin OR the Project Owner.
    Returns the Project object if authorized.
    """
    project_id_uuid = uuid.UUID(str(project_id))
    project = crud.project.get(db, id=project_id_uuid)
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    is_admin = "Admin" in current_user.roles
    is_owner = project.owner_id == uuid.UUID(current_user.user_id)

    if is_admin or is_owner:
        return project
    
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Must be Admin or Project Owner.")

def get_member_or_admin(project_id: Union[uuid.UUID, str], db: Session = Depends(get_db), current_user: TokenPayload = Depends(RoleChecker(ALL_ROLES))):
    """
    Dependency to ensure the current user is a Project Member (including Read-Only) or Admin.
    """
    project_id_uuid = uuid.UUID(str(project_id))
    
    project = crud.project.get(db, id=project_id_uuid)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    user_id_uuid = uuid.UUID(current_user.user_id)
    
    is_admin = "Admin" in current_user.roles
    is_member = crud.project_member.get(db, project_id=project_id_uuid, user_id=user_id_uuid)
    
    if is_admin or is_member:
        return project

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Must be Admin or a Project Member.")


# ----------------------------------------------------------------------
# Project Endpoints (CRUD)
# ----------------------------------------------------------------------

@router.post("/", response_model=schemas.Project, status_code=status.HTTP_201_CREATED, tags=["Projects"],
             dependencies=[Depends(get_task_creator_or_admin)]) # Access: Admin, Task Creator
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: schemas.ProjectCreate,
    current_user: TokenPayload = Depends(RoleChecker(ALL_ROLES))
):
    """Create a new project. Automatically sets the current user as owner and member."""
    owner_id = uuid.UUID(current_user.user_id)
    return crud.project.create_with_owner(db, obj_in=project_in, owner_id=owner_id)

@router.get("/", response_model=List[schemas.Project], tags=["Projects"])
def read_projects(
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(RoleChecker(ALL_ROLES)), # Access: All authenticated users
    skip: int = 0,
    limit: int = 100
):
    """Retrieve projects the user is involved in or has access to."""
    user_id = uuid.UUID(current_user.user_id)
    is_admin = "Admin" in current_user.roles
    
    if is_admin:
        return crud.project.get_multi(db, skip=skip, limit=limit)
    
    # Non-admin users only see projects they own or are members of (uses owner logic for now)
    return crud.project.get_user_projects(db, user_id=user_id) 

@router.get("/{project_id}", response_model=schemas.Project, tags=["Projects"])
def read_project(
    project_id: Union[uuid.UUID, str],
    project: Project = Depends(get_member_or_admin) # Access: Admin, Project Member
):
    """Get project details."""
    # Project object is returned by the dependency if authorized
    return project

@router.put("/{project_id}", response_model=schemas.Project, tags=["Projects"])
def update_project(
    project_id: Union[uuid.UUID, str],
    project_in: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    project_obj: Project = Depends(get_project_owner_or_admin) # Access: Admin, Project Owner
):
    """Update project details."""
    return crud.project.update(db, db_obj=project_obj, obj_in=project_in)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Projects"])
def delete_project(
    project_id: Union[uuid.UUID, str],
    db: Session = Depends(get_db),
    project_obj: Project = Depends(get_project_owner_or_admin) # Access: Admin, Project Owner
):
    """Delete a project."""
    crud.project.remove(db, id=project_obj.id)
    return None

# ----------------------------------------------------------------------
# Project Membership Endpoints
# ----------------------------------------------------------------------

@router.post("/{project_id}/members/{user_id}", response_model=schemas.Project, tags=["Project Members"])
def add_project_member(
    project_id: Union[uuid.UUID, str],
    user_id: Union[uuid.UUID, str],
    db: Session = Depends(get_db),
    project_obj: Project = Depends(get_project_owner_or_admin) # Access: Admin, Project Owner
):
    """Add a user to a project (makes them a project member)."""
    user_to_add = crud.user.get(db, id=user_id)
    if not user_to_add:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    # Create membership
    crud.project_member.create(db, project_id=project_obj.id, user_id=user_to_add.id)
    
    # Reload project to include new member (simplified - typically relationships would handle this)
    return crud.project.get(db, id=project_obj.id)

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Project Members"])
def remove_project_member(
    project_id: Union[uuid.UUID, str],
    user_id: Union[uuid.UUID, str],
    db: Session = Depends(get_db),
    project_obj: Project = Depends(get_project_owner_or_admin) # Access: Admin, Project Owner
):
    """Remove a user from a project."""
    member = crud.project_member.remove_member(db, project_id=project_obj.id, user_id=user_id)
    if not member:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User is not a member of this project.")
    return None