# backend/src/main.py

from fastapi import FastAPI
import uvicorn
from typing import Dict

# Initialize the FastAPI application
app = FastAPI(
    title="Task Tracker Backend API",
    version="0.1.0",
    description="Core REST API for managing tasks, projects, users, and roles."
)

@app.get("/")
def read_root() -> Dict[str, str]:
    """
    Root endpoint for basic health check.
    """
    return {"message": "Task Tracker API is running!", "status": "ok"}

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