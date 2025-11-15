from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from .models import Base, Role, User, Project, Task, ProjectMember
from .schemas import RoleCreate, RoleUpdate, UserCreate, UserUpdate

# Define type variables for generic CRUD operations
ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base class providing basic CRUD operations (Create, Read, Update, Delete).
    This implements the **Dependency Inversion Principle (DIP)** by abstracting
    database interactions.
    """
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete.
        :param model: A SQLAlchemy model class
        """
        self.model = model

    def get(self, db: Session, id: Union[uuid.UUID, str]) -> Optional[ModelType]:
        """Retrieve a single object by its primary key (ID)."""
        # SQLAlchemy 2.0 style select statement
        stmt = select(self.model).where(self.model.id == id)
        return db.scalar(stmt)

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Retrieve multiple objects with pagination."""
        stmt = select(self.model).offset(skip).limit(limit)
        return list(db.scalars(stmt))

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """Create a new object from a Pydantic schema."""
        # Convert schema to dict, then handle custom fields if necessary
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """Update an existing object from a Pydantic schema or dictionary."""
        # Convert SQLAlchemy object to dict
        obj_data = jsonable_encoder(db_obj)
        # Convert update schema or dict to a dictionary
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Union[uuid.UUID, str]) -> Optional[ModelType]:
        """Remove an object by its primary key (ID)."""
        db_obj = self.get(db, id=id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj


# --- Specific CRUD Services for Application Models ---

class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):
    """Service class for Role-specific database operations."""
    def get_by_name(self, db: Session, *, name: str) -> Optional[Role]:
        """Retrieve a role by its unique name."""
        stmt = select(self.model).where(self.model.name == name)
        return db.scalar(stmt)

# Instantiate the Role CRUD service
role = CRUDRole(Role)


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """Service class for User-specific database operations."""
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Retrieve a user by their unique email."""
        stmt = select(self.model).where(self.model.email == email)
        return db.scalar(stmt)
    
    # Override create to handle password hashing (placeholder)
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        # NOTE: In a real app, obj_in.password must be hashed here.
        # Placeholder for password hashing logic:
        hashed_password = f"mock_hashed_{obj_in.password}" 
        
        db_obj = self.model(
            email=obj_in.email,
            name=obj_in.name,
            role_id=obj_in.role_id,
            hashed_password=hashed_password # Use the placeholder hash
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# Instantiate the User CRUD service
user = CRUDUser(User)


# TODO: Create specific CRUD classes for Project and Task next