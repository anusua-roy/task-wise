from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.core.enums import TaskStatus
from sqlalchemy import text
import os


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
    admin_role = Role(name="Admin", description="System administrator")
    creator_role = Role(name="Task Creator", description="Can manage projects/tasks")
    readonly_role = Role(name="Read-Only", description="View + complete tasks only")

    db.add_all([admin_role, creator_role, readonly_role])
    db.commit()

    db.refresh(admin_role)
    db.refresh(creator_role)
    db.refresh(readonly_role)

    # ---------------------
    # USERS
    # ---------------------
    admin = User(
        email="admin@taskwise.com",
        name="Admin User",
        role_id=admin_role.id,
    )

    creator1 = User(
        email="creator1@taskwise.com",
        name="Project Owner 1",
        role_id=creator_role.id,
    )

    creator2 = User(
        email="creator2@taskwise.com",
        name="Project Owner 2",
        role_id=creator_role.id,
    )

    readonly = User(
        email="readonly@taskwise.com",
        name="Read Only User",
        role_id=readonly_role.id,
    )

    db.add_all([admin, creator1, creator2, readonly])
    db.commit()

    # ---------------------
    # PROJECT 1 (creator1)
    # ---------------------
    p1 = Project(
        name="Website Redesign",
        description="Revamp company website",
        created_by_id=creator1.id,
    )
    db.add(p1)
    db.commit()
    db.refresh(p1)

    db.add_all(
        [
            ProjectMember(project_id=p1.id, user_id=creator1.id, role="Owner"),
            ProjectMember(project_id=p1.id, user_id=creator2.id, role="Member"),
            ProjectMember(project_id=p1.id, user_id=readonly.id, role="Member"),
        ]
    )
    db.commit()

    # TASKS (P1)
    t1 = Task(
        title="Design landing page",
        description="Create wireframes",
        status=TaskStatus.NEW.value,
        project_id=p1.id,
        created_by_id=creator1.id,
    )

    t2 = Task(
        title="Implement hero section",
        description="Frontend work",
        status=TaskStatus.IN_PROGRESS.value,
        project_id=p1.id,
        created_by_id=creator1.id,
    )

    db.add_all([t1, t2])
    db.commit()

    db.add_all(
        [
            TaskAssignee(task_id=t1.id, user_id=readonly.id),
            TaskAssignee(task_id=t2.id, user_id=creator2.id),
        ]
    )
    db.commit()

    # ---------------------
    # PROJECT 2 (creator2)
    # ---------------------
    p2 = Project(
        name="Mobile App Launch",
        description="Launch mobile app",
        created_by_id=creator2.id,
    )
    db.add(p2)
    db.commit()
    db.refresh(p2)

    db.add_all(
        [
            ProjectMember(project_id=p2.id, user_id=creator2.id, role="Owner"),
            ProjectMember(project_id=p2.id, user_id=creator1.id, role="Member"),
            ProjectMember(project_id=p2.id, user_id=readonly.id, role="Member"),
        ]
    )
    db.commit()

    t3 = Task(
        title="API contracts",
        description="Define backend APIs",
        status=TaskStatus.NEW.value,
        project_id=p2.id,
        created_by_id=creator2.id,
    )

    db.add(t3)
    db.commit()

    db.add(TaskAssignee(task_id=t3.id, user_id=readonly.id))
    db.commit()

    db.close()
    print("Database seeded successfully.")


# =========================
# ENTRY
# =========================
if __name__ == "__main__":
    if os.getenv("RESET_DB", "true").lower() == "true":
        reset_database()
    run()
