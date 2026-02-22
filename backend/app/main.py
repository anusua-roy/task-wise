from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.role import Role
from app.models.user import User
from app.api import users, roles, projects, tasks

app = FastAPI(title="FSE Task Tracker")

Base.metadata.create_all(bind=engine)

# Seed roles
def seed_roles():
    db = SessionLocal()
    if not db.query(Role).first():
        db.add_all([
            Role(name="Admin", description="Full access"),
            Role(name="Task Creator", description="Create/manage tasks"),
            Role(name="Read-Only", description="View and complete tasks")
        ])
        db.commit()
    db.close()

def seed_admin():
    db = SessionLocal()
    admin_role = db.query(Role).filter(Role.name == "Admin").first()

    existing = db.query(User).filter(User.email == "admin@taskwise.com").first()
    if not existing:
        db.add(User(
            email="admin@taskwise.com",
            name="Admin",
            role_id=admin_role.id
        ))
        db.commit()
    db.close()

seed_roles()
seed_admin()

app.include_router(users.router)
app.include_router(roles.router)
app.include_router(projects.router)
app.include_router(tasks.router)