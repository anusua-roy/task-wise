l// src/types/task.ts
export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

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