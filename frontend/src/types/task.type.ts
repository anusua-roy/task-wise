// src/types/task.ts
export type TaskStatus = "New" | "In Progress" | "Blocked" | "Done";

export interface Task {
  id: string;
  title: string;
  due_date?: string | null; // ISO string
  project_id?: string;
  description?: string;
  status: TaskStatus;
  assignees?: [{ id: string; name: string; email: string }] | null;
  dueDate?: string | null; // ISO string
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
}

export interface TaskPayload {
  title: string;
  project_id?: string;
  due_date?: string | null; // ISO string
  description?: string;
  status: string;
  assignees?: string[] | null;
}
