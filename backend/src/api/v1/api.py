from fastapi import APIRouter

from .endpoints import users, roles, auth, projects
# Tasks router will be added here

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects", "Project Members"])
# Tasks will go here