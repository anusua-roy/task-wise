from fastapi import APIRouter

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

@router.get("/")
def list_projects():
    return {"message": "Projects endpoint working"}