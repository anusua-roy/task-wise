from fastapi import HTTPException


def is_admin(user):
    return user.role.name == "Admin"


def is_task_creator(user):
    return user.role.name == "Task Creator"


def is_read_only(user):
    return user.role.name == "Read-Only"


# ---------- PROJECT ----------


def can_view_project(user, project, membership):
    if is_admin(user):
        return True
    if membership:
        return True
    raise HTTPException(status_code=403, detail="Access denied")


def can_modify_project(user, project, membership):
    if is_admin(user):
        return True
    if project.created_by_id == user.id:
        return True
    raise HTTPException(status_code=403, detail="Only owner can modify project")


# ---------- TASK ----------


def can_create_task(user):
    if is_admin(user) or is_task_creator(user):
        return True
    raise HTTPException(status_code=403, detail="Not allowed to create task")


def can_modify_task(user, task):
    if is_admin(user):
        return True
    if task.created_by_id == user.id:
        return True
    raise HTTPException(status_code=403, detail="Not allowed to modify task")


def can_update_task_status(user, task):
    if is_admin(user):
        return True
    if is_read_only(user) and task.owner_id == user.id:
        return True
    raise HTTPException(status_code=403, detail="Not allowed to update status")
