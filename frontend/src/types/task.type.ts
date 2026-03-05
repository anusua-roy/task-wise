// src/types/task.ts
export type TaskStatus = "New" | "In Progress" | "Blocked" | "Done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  tags?: string[];
  assignee?: { id: string; name: string } | null;
  dueDate?: string | null; // ISO string
  createdAt: string; // ISO
  updatedAt?: string; // ISO
}
