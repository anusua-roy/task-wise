from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt

from app.models.user import User
from app.api.deps import get_db
from sqlalchemy.orm import Session

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def require_role(role_name: str):
    def role_checker(current_user: User = Depends(get_current_user)):

        if current_user.role.name != role_name:
            raise HTTPException(
                status_code=403,
                detail=f"{role_name} access required",
            )

        return current_user

    return role_checker
