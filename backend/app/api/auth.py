from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import os

from app.models.user import User
from app.api.deps import get_db
from app.core.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
ACCESS_TOKEN_EXPIRE_MINUTES = 60


@router.post("/google")
def google_login(payload: dict, db: Session = Depends(get_db)):
    google_token = payload.get("token")

    # =========================
    # VALIDATE INPUT
    # =========================
    if not google_token:
        raise HTTPException(status_code=400, detail="Token missing")

    # =========================
    # VERIFY GOOGLE TOKEN
    # =========================
    try:
        idinfo = id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}",
        )

    # =========================
    # VALIDATE ISSUER (SECURITY)
    # =========================
    if idinfo.get("iss") not in [
        "accounts.google.com",
        "https://accounts.google.com",
    ]:
        raise HTTPException(status_code=401, detail="Invalid token issuer")

    # =========================
    # EXTRACT USER INFO
    # =========================
    email = idinfo.get("email")
    # name = idinfo.get("name")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    email = email.lower()  # normalize

    # =========================
    # STRICT USER CHECK (NO AUTO SIGNUP)
    # =========================
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You are not authorized to use this system.",
        )

    # =========================
    # CREATE JWT TOKEN
    # =========================
    access_token = create_access_token({"sub": str(user.id)})

    # =========================
    # RESPONSE
    # =========================
    return {
        "access_token": access_token,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.name if user.role else None,
        },
    }
