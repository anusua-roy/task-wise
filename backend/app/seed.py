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
# HELPERS
# =========================
def random_date(days_offset):
    return datetime.utcnow() + timedelta(days=days_offset)


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
    # USERS (REALISTIC)
    # ---------------------
    users = [
        User(name="Anusua Roy", email="anusua@taskwise.com", role_id=roles["admin"].id),
        User(
            name="Arjun Mehta", email="arjun@taskwise.com", role_id=roles["creator"].id
        ),
        User(
            name="Priya Sharma", email="priya@taskwise.com", role_id=roles["creator"].id
        ),
        User(name="Rahul Das", email="rahul@taskwise.com", role_id=roles["creator"].id),
        User(
            name="Sneha Kapoor",
            email="sneha@taskwise.com",
            role_id=roles["readonly"].id,
        ),
        User(
            name="Amit Verma", email="amit@taskwise.com", role_id=roles["readonly"].id
        ),
        User(
            name="Neha Singh", email="neha@taskwise.com", role_id=roles["readonly"].id
        ),
        User(name="Dev Patel", email="dev@taskwise.com", role_id=roles["creator"].id),
        User(
            name="Karan Malhotra",
            email="karan@taskwise.com",
            role_id=roles["readonly"].id,
        ),
        User(name="Test User", email="test@taskwise.com", role_id=roles["readonly"].id),
    ]

    db.add_all(users)
    db.commit()

    # Helper maps
    creators = [u for u in users if u.role_id == roles["creator"].id]

    # ---------------------
    # PROJECTS
    # ---------------------
    projects = [
        Project(
            name="Website Redesign",
            description="Revamp UI + performance optimization",
            created_by_id=creators[0].id,
        ),
        Project(
            name="Mobile App Launch",
            description="iOS + Android rollout",
            created_by_id=creators[1].id,
        ),
        Project(
            name="Internal Dashboard",
            description="Analytics + BI dashboards",
            created_by_id=creators[2].id,
        ),
        Project(
            name="Edge Case Project",
            description="Minimal members project",
            created_by_id=creators[0].id,
        ),
    ]

    db.add_all(projects)
    db.commit()

    # ---------------------
    # PROJECT MEMBERS
    # ---------------------
    for p in projects:
        # owner
        db.add(ProjectMember(project_id=p.id, user_id=p.created_by_id, role="Owner"))

        # random members
        for u in random.sample(users, k=3):
            if u.id != p.created_by_id:
                db.add(ProjectMember(project_id=p.id, user_id=u.id, role="Member"))

    db.commit()

    # ---------------------
    # TASKS (REALISTIC + EDGE CASES)
    # ---------------------
    statuses = [
        TaskStatus.NEW.value,
        TaskStatus.IN_PROGRESS.value,
        TaskStatus.BLOCKED.value,
        TaskStatus.DONE.value,
    ]

    task_titles = [
        "Setup CI/CD",
        "Fix login bug",
        "Improve performance",
        "Refactor API",
        "Write unit tests",
        "Optimize bundle size",
        "Add analytics tracking",
        "Implement RBAC",
        "Fix mobile UI issues",
        "Database migration",
    ]

    all_tasks = []

    for p in projects:
        for i in range(8):  # ~32 tasks total
            status = random.choice(statuses)

            task = Task(
                title=random.choice(task_titles),
                description=f"Task {i} for {p.name}",
                status=status,
                project_id=p.id,
                created_by_id=p.created_by_id,
                due_date=random.choice(
                    [
                        random_date(-5),  # overdue
                        random_date(0),  # today
                        random_date(5),  # future
                        None,  # edge case: no due date
                    ]
                ),
            )

            db.add(task)
            db.flush()

            # ASSIGNEES (EDGE CASES)
            assign_type = random.choice(["none", "single", "multiple"])

            if assign_type == "single":
                user = random.choice(users)
                db.add(TaskAssignee(task_id=task.id, user_id=user.id))

            elif assign_type == "multiple":
                for u in random.sample(users, k=2):
                    db.add(TaskAssignee(task_id=task.id, user_id=u.id))

            # none = unassigned

            all_tasks.append(task)

    db.commit()

    db.close()
    print("🔥 Database seeded with realistic + edge-case data.")


# =========================
# ENTRY
# =========================
if __name__ == "__main__":
    if os.getenv("RESET_DB", "true").lower() == "true":
        reset_database()
    run()
