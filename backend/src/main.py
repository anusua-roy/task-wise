# backend/src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict

# Import the main API router
from .api.v1.api import api_router

# Initialize the FastAPI application
app = FastAPI(
    title="Task Tracker Backend API",
    version="0.1.0",
    description="Core REST API for managing tasks, projects, users, and roles."
)

# ----------------------------------------------------------------------
# CORS Middleware Setup
# The React frontend runs on a different port (typically 5173), so CORS is mandatory.
# ----------------------------------------------------------------------
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite dev server port
    "http://127.0.0.1:5173",
    # Add production frontend URL here when known
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------------------------------------
# Include Routers
# ----------------------------------------------------------------------

# Include the main router for API version 1
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root() -> Dict[str, str]:
    """
    Root endpoint for basic health check.
    """
    return {"message": "task-wise API is running!", "status": "ok"}

@app.get("/api/health")
def api_health() -> Dict[str, str]:
    """
    Specific health check for API readiness.
    """
    return {"status": "healthy"}

# To run this file directly for development (not recommended in production/docker)
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# Note: In a real project, we would use a proper WSGI server (like Gunicorn)
# and a production setup for deployment.