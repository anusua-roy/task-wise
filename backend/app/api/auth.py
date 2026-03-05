from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.schemas.user import UserRead
from app.api.deps import get_db

router = APIRouter(tags=["Auth"])


@router.post("/login", response_model=UserRead)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email")

    return user
