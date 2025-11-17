export type TaskStatus = "todo" | "inprogress" | "done";

export type Task = {
  id: string;
  title: string;
  assignee?: string; // just a name for now — later could be {id,name,avatar}
  status: TaskStatus;
  due?: string; // ISO date or human string
  priority?: "low" | "medium" | "high";
};
