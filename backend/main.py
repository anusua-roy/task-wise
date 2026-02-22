# backend/main.py
import os
from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()
print("DATABASE_URL:", os.getenv("DATABASE_URL"))  # temporary debug

from database import SessionLocal, create_db_and_tables
from models import User, Project, Task
from schemas import UserRead, UserCreate, ProjectCreate, ProjectRead, TaskCreate, TaskRead



app = FastAPI(title="TaskWise - minimal SQLAlchemy backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # narrow in prod
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer()
# startup create tables
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    # ensure admin exists
    db = SessionLocal()
    try:
        admin = db.execute(select(User).where(User.email == "admin@example.com")).scalar_one_or_none()
        if not admin:
            u = User(name="Admin", email="admin@example.com", is_admin=True)
            db.add(u); db.commit()
    finally:
        db.close()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Very simple auth flow (mock): login -> sessionId, verify -> returns token & user
SESSIONS = {}
TOKENS = {}

@app.post("/auth/login")
def auth_login(payload: dict):
    # expects {"email":"..."}
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="email required")
    sid = os.urandom(8).hex()
    SESSIONS[sid] = {"email": email, "code": "123456"}
    return {"sessionId": sid, "nextStep": "verify", "message": "Use code 123456 (mock)"}

@app.post("/auth/verify")
def auth_verify(payload: dict, db: Session = Depends(get_db)):
    sid = payload.get("sessionId")
    code = payload.get("code")
    s = SESSIONS.get(sid)
    if not s or s.get("code") != code:
        raise HTTPException(status_code=400, detail="invalid session or code")
    email = s["email"]
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        user = User(name=email.split("@")[0], email=email, is_admin=False)
        db.add(user)
        db.commit()
        db.refresh(user)
    token = os.urandom(16).hex()
    TOKENS[token] = user.id
    SESSIONS.pop(sid, None)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "is_admin": user.is_admin}}

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    uid = TOKENS.get(token)
    if not uid:
        raise HTTPException(status_code=401, detail="invalid token")

    user = db.get(User, uid)
    if not user:
        raise HTTPException(status_code=401, detail="user not found")

    return user

# Projects endpoints
@app.get("/projects", response_model=List[ProjectRead])
def list_projects(db: Session = Depends(get_db)):
    rows = db.scalars(select(Project).order_by(Project.created_at.desc())).all()
    return rows

@app.post("/projects", response_model=ProjectRead, status_code=201)
def create_project(payload: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="only admin")
    p = Project(
        title=payload.title, description=payload.description or "", tags=payload.tags or "",
        repo_url=payload.repo_url or "", live_url=payload.live_url or ""
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.get("/projects/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="not found")
    return p

# Tasks endpoints
@app.get("/tasks", response_model=List[TaskRead])
def list_tasks(assignee_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = select(Task)
    if assignee_id:
        q = q.where(Task.assignee_id == assignee_id)
    if status:
        q = q.where(Task.status == status)
    rows = db.scalars(q.order_by(Task.created_at.desc())).all()
    return rows

@app.post("/tasks", response_model=TaskRead, status_code=201)
def create_task(payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    t = Task(
        title=payload.title, description=payload.description or "", status=payload.status or "todo",
        tags=payload.tags or "", assignee_id=payload.assignee_id, project_id=payload.project_id
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@app.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    t = db.get(Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="not found")
    t.title = payload.title
    t.description = payload.description or t.description
    t.status = payload.status or t.status
    t.tags = payload.tags or t.tags
    t.assignee_id = payload.assignee_id
    t.project_id = payload.project_id
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

# Profile
@app.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "is_admin": current_user.is_admin}
