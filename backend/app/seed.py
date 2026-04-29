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
    # USERS (LIMITED SET)
    # ---------------------
    users = [
        User(name="Admin User", email="admin@taskwise.com", role_id=roles["admin"].id),
        User(
            name="Creator One",
            email="creator1@taskwise.com",
            role_id=roles["creator"].id,
        ),
        User(
            name="Creator Two",
            email="creator2@taskwise.com",
            role_id=roles["creator"].id,
        ),
        User(
            name="Viewer One",
            email="viewer1@taskwise.com",
            role_id=roles["readonly"].id,
        ),
        User(
            name="Viewer Two",
            email="viewer2@taskwise.com",
            role_id=roles["readonly"].id,
        ),
    ]

    db.add_all(users)
    db.commit()

    creators = users[1:3]

    # ---------------------
    # PROJECTS (WITH DATES)
    # ---------------------
    today = datetime.utcnow()

    projects = [
        Project(
            name="Website Redesign",
            description="UI overhaul",
            created_by_id=creators[0].id,
            start_date=today - timedelta(days=10),
            end_date=today + timedelta(days=20),
        ),
        Project(
            name="Mobile App",
            description="Launch Android/iOS",
            created_by_id=creators[1].id,
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
        members = []

        # Owner
        db.add(ProjectMember(project_id=p.id, user_id=p.created_by_id, role="Owner"))
        members.append(p.created_by_id)

        # Add 2 more members
        extra_members = random.sample(users, k=2)
        for u in extra_members:
            if u.id != p.created_by_id:
                db.add(ProjectMember(project_id=p.id, user_id=u.id, role="Member"))
                members.append(u.id)

        project_members_map[p.id] = list(set(members))

    db.commit()

    # ---------------------
    # TASKS (VALID DUE DATES)
    # ---------------------
    statuses = [
        TaskStatus.NEW.value,
        TaskStatus.IN_PROGRESS.value,
        TaskStatus.BLOCKED.value,
        TaskStatus.DONE.value,
    ]

    titles = [
        "Setup CI/CD",
        "Fix Bug",
        "Optimize UI",
        "Write Tests",
        "Refactor Code",
    ]

    for p in projects:
        member_ids = project_members_map[p.id]

        for i in range(6):
            # Generate due date INSIDE project range
            if random.choice([True, False]):
                delta_days = random.randint(0, (p.end_date - p.start_date).days)
                due_date = p.start_date + timedelta(days=delta_days)
            else:
                due_date = None  # keep some unassigned dates

            task = Task(
                title=random.choice(titles),
                description=f"Task {i} for {p.name}",
                status=random.choice(statuses),
                project_id=p.id,
                created_by_id=p.created_by_id,
                due_date=due_date,
            )

            db.add(task)
            db.flush()

            # ---------------------
            # ASSIGNMENT (INTENTIONAL MIX)
            # ---------------------
            assign_type = random.choice(["none", "single", "multiple"])

            if assign_type == "single":
                db.add(TaskAssignee(task_id=task.id, user_id=random.choice(member_ids)))

            elif assign_type == "multiple":
                selected = random.sample(member_ids, k=min(2, len(member_ids)))
                for uid in selected:
                    db.add(TaskAssignee(task_id=task.id, user_id=uid))

            # "none" → keep unassigned

    db.commit()
    db.close()

    print("Database seeded with clean realistic data.")


# =========================
# ENTRY
# =========================
if __name__ == "__main__":
    if os.getenv("RESET_DB", "true").lower() == "true":
        reset_database()
    run()
