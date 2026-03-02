from enum import Enum


class TaskStatus(str, Enum):
    NEW = "New"
    IN_PROGRESS = "In Progress"
    BLOCKED = "Blocked"
    DONE = "Done"
