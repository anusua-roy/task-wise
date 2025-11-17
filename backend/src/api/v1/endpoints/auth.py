# backend/src/api/v1/endpoints/auth.py
from typing import List, Optional
from fastapi import Depends, Header, HTTPException, status, APIRouter
from pydantic import BaseModel, EmailStr

# ---- Role list (single source of truth for endpoint-level auth) ----
ALL_ROLES: List[str] = ["Admin", "Task Creator", "Read-Only"]

# ---- Token / payload schema used by endpoints ----
class TokenData(BaseModel):
    """Normalized token payload used across endpoints."""
    email: Optional[EmailStr] = None
    roles: List[str] = []

# ---- Dev stub: header-based token payload (local dev only) ----
def _dev_token_data(
    x_user_email: Optional[str] = Header(None),
    x_user_roles: Optional[str] = Header(None),
) -> TokenData:
    """
    Development helper:
      - x-user-email: user email (string)
      - x-user-roles: comma-separated role names, e.g. "Admin,Task Creator"
    This avoids wiring a full OIDC/JWT stack during early development.
    """
    roles: List[str] = []
    if x_user_roles:
        roles = [r.strip() for r in x_user_roles.split(",") if r.strip()]
    return TokenData(email=x_user_email, roles=roles)

# ---- Optional: try to import python-jose for future JWT parsing (non-blocking) ----
try:
    from jose import jwt, JWTError  # type: ignore
    _HAS_JOSE = True
except Exception:
    JWTError = Exception  # type: ignore
    _HAS_JOSE = False

def _get_token_data(
    authorization: Optional[str] = Header(None, convert_underscores=False),
    x_user_email: Optional[str] = Header(None),
    x_user_roles: Optional[str] = Header(None),
) -> TokenData:
    """
    Choose real JWT parsing if available and Authorization header is provided,
    otherwise fall back to header-based dev stub.
    (Production: implement JWT decoding using python-jose + JWKS verification.)
    """
    # If jwt support is present and an Authorization header exists, you may decode here.
    # For now, we prefer the dev header fallback to keep local dev simple.
    if _HAS_JOSE and authorization:
        # NOTE: implement actual verify/decode flow here when ready.
        # token = authorization.removeprefix("Bearer ").strip()
        # payload = jwt.decode(token, jwks_key, algorithms=["RS256"], audience=..., issuer=...)
        # return TokenData(email=payload.get("email"), roles=payload.get("roles", []))
        # Until implemented, fallback to headers for local dev.
        pass

    return _dev_token_data(x_user_email=x_user_email, x_user_roles=x_user_roles)

# ---- Role-checker dependency factory ----
class RoleChecker:
    """
    Dependency factory ensuring current token contains at least one allowed role.
    Usage:
        get_admin = RoleChecker(["Admin"])
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed = set(allowed_roles)

    def __call__(self, token: TokenData = Depends(_get_token_data)) -> TokenData:
        if not token or not token.email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        if self.allowed and not (self.allowed & set(token.roles or [])):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return token

# Pre-built dependencies for easy reuse in endpoints
get_admin = RoleChecker(["Admin"])
get_task_creator_or_admin = RoleChecker(["Admin", "Task Creator"])
get_readonly = RoleChecker(["Read-Only"])

# Generic "authenticated user" dependency
def get_current_user(token: TokenData = Depends(_get_token_data)) -> TokenData:
    if not token.email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing user")
    return token

# ---- Minimal router for auth-related endpoints (optional) ----
router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=TokenData)
def me(current: TokenData = Depends(get_current_user)):
    """Return the normalized token payload (email + roles)."""
    return current

@router.post("/logout", status_code=204)
def logout():
    """Placeholder logout endpoint (no-op for header-based dev stub)."""
    return None
