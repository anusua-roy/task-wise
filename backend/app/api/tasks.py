from fastapi import APIRouter

router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)

@router.get("/")
def list_tasks():
    return {"message": "Tasks endpoint working"}