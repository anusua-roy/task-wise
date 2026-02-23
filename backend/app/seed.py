from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.project_member import ProjectMember
import os


def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)


def run():
    db = SessionLocal()

    # ---- Roles ----
    admin_role = Role(name="Admin", description="Full access")
    creator_role = Role(name="Task Creator", description="Create/manage tasks")
    readonly_role = Role(name="Read-Only", description="View and complete tasks")

    db.add_all([admin_role, creator_role, readonly_role])
    db.commit()

    # ---- Users ----
    admin = User(email="admin@taskwise.com", name="Admin", role_id=admin_role.id)

    creator = User(
        email="creator@taskwise.com", name="Creator", role_id=creator_role.id
    )

    readonly = User(
        email="readonly@taskwise.com", name="ReadOnly", role_id=readonly_role.id
    )

    db.add_all([admin, creator, readonly])
    db.commit()

    # ---- Project ----
    project = Project(
        name="Demo Project", description="Seeded Project", owner_id=creator.id
    )

    db.add(project)
    db.commit()

    # ---- Project Members ----
    db.add_all(
        [
            ProjectMember(project_id=project.id, user_id=creator.id),
            ProjectMember(project_id=project.id, user_id=readonly.id),
        ]
    )
    db.commit()

    # ---- Task ----
    task = Task(
        description="Seeded Task",
        status="New",
        project_id=project.id,
        owner_id=readonly.id,
        created_by_id=creator.id,
    )

    db.add(task)
    db.commit()

    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    if os.getenv("RESET_DB", "true").lower() == "true":
        reset_database()
    run()
