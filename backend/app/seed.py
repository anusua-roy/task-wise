from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.task import Task, TaskAssignee
from app.models.project_member import ProjectMember
from app.core.enums import TaskStatus
import os


def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)


def run():
    db = SessionLocal()

    # ROLES
    admin_role = Role(name="Admin", description="System administrator")
    user_role = Role(name="User", description="Regular user")
    db.add_all([admin_role, user_role])
    db.commit()

    # USERS
    alice = User(
        email="alice@taskwise.com", name="Alice Johnson", role_id=admin_role.id
    )
    bob = User(email="bob@taskwise.com", name="Bob Smith", role_id=user_role.id)
    charlie = User(
        email="charlie@taskwise.com", name="Charlie Brown", role_id=user_role.id
    )
    diana = User(email="diana@taskwise.com", name="Diana Prince", role_id=user_role.id)

    db.add_all([alice, bob, charlie, diana])
    db.commit()

    # PROJECT 1
    p1 = Project(
        name="Website Redesign",
        description="Revamp company website",
        created_by_id=bob.id,
    )
    db.add(p1)
    db.commit()
    db.refresh(p1)

    db.add_all(
        [
            ProjectMember(project_id=p1.id, user_id=bob.id, role="Owner"),
            ProjectMember(project_id=p1.id, user_id=charlie.id, role="Member"),
            ProjectMember(project_id=p1.id, user_id=diana.id, role="Member"),
        ]
    )
    db.commit()

    t1 = Task(
        title="Design landing page",
        description="Create wireframes",
        status=TaskStatus.NEW.value,
        project_id=p1.id,
        created_by_id=bob.id,
    )
    db.add(t1)
    db.commit()
    db.add(TaskAssignee(task_id=t1.id, user_id=charlie.id))
    db.commit()

    t2 = Task(
        title="Implement hero section",
        description="Frontend implementation",
        status=TaskStatus.IN_PROGRESS.value,
        project_id=p1.id,
        created_by_id=bob.id,
    )
    db.add(t2)
    db.commit()
    db.add(TaskAssignee(task_id=t2.id, user_id=charlie.id))
    db.commit()

    t3 = Task(
        title="Setup CI/CD",
        description="Configure deployment pipeline",
        status=TaskStatus.BLOCKED.value,
        project_id=p1.id,
        created_by_id=bob.id,
    )
    db.add(t3)
    db.commit()
    db.add(TaskAssignee(task_id=t3.id, user_id=bob.id))
    db.commit()

    # PROJECT 2
    p2 = Project(
        name="Mobile App Launch",
        description="Launch new mobile application",
        created_by_id=charlie.id,
    )
    db.add(p2)
    db.commit()
    db.refresh(p2)

    db.add_all(
        [
            ProjectMember(project_id=p2.id, user_id=charlie.id, role="Owner"),
            ProjectMember(project_id=p2.id, user_id=bob.id, role="Member"),
        ]
    )
    db.commit()

    t4 = Task(
        title="Create API contracts",
        description="Define backend APIs",
        status=TaskStatus.NEW.value,
        project_id=p2.id,
        created_by_id=charlie.id,
    )
    db.add(t4)
    db.commit()
    db.add(TaskAssignee(task_id=t4.id, user_id=bob.id))
    db.commit()

    t5 = Task(
        title="Setup Firebase",
        description="Configure push notifications",
        status=TaskStatus.DONE.value,
        project_id=p2.id,
        created_by_id=charlie.id,
    )
    db.add(t5)
    db.commit()
    db.add(TaskAssignee(task_id=t5.id, user_id=charlie.id))
    db.commit()

    # PROJECT 3
    p3 = Project(
        name="Internal Tools Upgrade",
        description="Upgrade internal admin dashboards",
        created_by_id=diana.id,
    )
    db.add(p3)
    db.commit()
    db.refresh(p3)

    db.add(ProjectMember(project_id=p3.id, user_id=diana.id, role="Owner"))
    db.commit()

    t6 = Task(
        title="Migrate database schema",
        description="Refactor legacy tables",
        status=TaskStatus.IN_PROGRESS.value,
        project_id=p3.id,
        created_by_id=diana.id,
    )
    db.add(t6)
    db.commit()
    db.add(TaskAssignee(task_id=t6.id, user_id=diana.id))
    db.commit()

    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    if os.getenv("RESET_DB", "true").lower() == "true":
        reset_database()
    run()
