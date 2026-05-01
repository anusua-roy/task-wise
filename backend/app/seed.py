from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.core.enums import TaskStatus
from sqlalchemy import text
from datetime import datetime, timedelta
import os
import random


# =========================
# RESET DB
# =========================
def reset_database():
    print("Resetting database safely...")

    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.commit()

    Base.metadata.create_all(bind=engine)
    print("Database reset complete.")


# =========================
# SEED DATA
# =========================
def run():
    db = SessionLocal()

    # ---------------------
    # ROLES
    # ---------------------
    roles = {
        "admin": Role(name="Admin", description="System administrator"),
        "creator": Role(name="Task Creator", description="Can manage everything"),
        "readonly": Role(name="Read-Only", description="View + complete tasks"),
    }

    db.add_all(roles.values())
    db.commit()

    # ---------------------
    # USERS (ONLY REAL USER)
    # ---------------------
    admin_user = User(
        name="Anusua Roy",
        email="anusua.roy05@gmail.com",  # ⚠️ MUST match Google account
        role_id=roles["admin"].id,
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    # ---------------------
    # PROJECTS (WITH DATES)
    # ---------------------
    today = datetime.utcnow()

    projects = [
        Project(
            name="Website Redesign",
            description="UI overhaul and performance optimization",
            created_by_id=admin_user.id,
            start_date=today - timedelta(days=10),
            end_date=today + timedelta(days=20),
        ),
        Project(
            name="Mobile App Launch",
            description="Launch Android and iOS apps",
            created_by_id=admin_user.id,
            start_date=today - timedelta(days=5),
            end_date=today + timedelta(days=30),
        ),
    ]

    db.add_all(projects)
    db.commit()

    # ---------------------
    # PROJECT MEMBERS
    # ---------------------
    project_members_map = {}

    for p in projects:
        db.add(
            ProjectMember(
                project_id=p.id,
                user_id=admin_user.id,
                role="Owner",
            )
        )

        project_members_map[p.id] = [admin_user.id]

    db.commit()

    # ---------------------
    # TASKS
    # ---------------------
    statuses = [
        TaskStatus.NEW.value,
        TaskStatus.IN_PROGRESS.value,
        TaskStatus.BLOCKED.value,
        TaskStatus.DONE.value,
    ]

    titles = [
        "Setup CI/CD",
        "Fix login bug",
        "Optimize UI performance",
        "Write unit tests",
        "Refactor API layer",
        "Improve accessibility",
    ]

    for p in projects:
        for i in range(6):

            # Due date inside project range OR None
            if random.choice([True, False]):
                delta_days = random.randint(0, (p.end_date - p.start_date).days)
                due_date = p.start_date + timedelta(days=delta_days)
            else:
                due_date = None

            task = Task(
                title=random.choice(titles),
                description=f"Task {i + 1} for {p.name}",
                status=random.choice(statuses),
                project_id=p.id,
                created_by_id=admin_user.id,
                due_date=due_date,
            )

            db.add(task)
            db.flush()

            # ---------------------
            # ASSIGNMENT (MIX)
            # ---------------------
            if random.choice([True, False]):
                db.add(
                    TaskAssignee(
                        task_id=task.id,
                        user_id=admin_user.id,
                    )
                )
            # else → leave unassigned

    db.commit()
    db.close()

    print("✅ Database seeded with SSO-compatible clean data.")


# =========================
# ENTRY
# =========================
if __name__ == "__main__":
    if os.getenv("RESET_DB", "true").lower() == "true":
        reset_database()
    run()
