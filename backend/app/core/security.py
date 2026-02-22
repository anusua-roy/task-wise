from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User

security = HTTPBearer()

ROLE_HIERARCHY = {
    "Read-Only": 1,
    "Task Creator": 2,
    "Admin": 3,
}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    # TEMP: token = email
    user = db.query(User).filter(User.email == token).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    return user

def require_role(required_role: str):
    def role_checker(user: User = Depends(get_current_user)):
        if ROLE_HIERARCHY[user.role.name] < ROLE_HIERARCHY[required_role]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker