// src/api/tasks.ts
// Replace these mock functions with real fetch/axios calls when backend is ready.

import { Task } from '../types/task';

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Refactor ProjectCard for mobile',
    description: 'Make project card responsive and add accessible labels',
    status: 'in-progress',
    tags: ['ui', 'mobile'],
    assignee: { id: 'u1', name: 'Anusua Roy' },
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Draft API contract for projects',
    description: 'Finalize the POST/PUT payloads for projects endpoints',
    status: 'todo',
    tags: ['backend', 'docs'],
    assignee: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'Audit global css variables',
    description: 'Ensure dark mode variables are consistent across projects',
    status: 'blocked',
    tags: ['css', 'infra'],
    assignee: { id: 'u1', name: 'Anusua Roy' },
    dueDate: null,
    createdAt: new Date().toISOString(),
  },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getMyTasks(): Promise<Task[]> {
  await delay();
  // return deep copy to avoid mutations in tests
  return JSON.parse(JSON.stringify(mockTasks));
}

export async function createTask(payload: Partial<Task>): Promise<Task> {
  await delay();
  const newTask: Task = {
    id: `t${Math.random().toString(36).slice(2, 9)}`,
    title: payload.title || 'Untitled',
    description: payload.description,
    status: (payload.status as Task['status']) || 'todo',
    tags: payload.tags || [],
    assignee: payload.assignee || null,
    dueDate: payload.dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
  };
  mockTasks.unshift(newTask);
  return JSON.parse(JSON.stringify(newTask));
}

export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  await delay();
  const idx = mockTasks.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Not found');
  mockTasks[idx] = { ...mockTasks[idx], ...payload, updatedAt: new Date().toISOString() };
  return JSON.parse(JSON.stringify(mockTasks[idx]));
}

export async function deleteTask(id: string): Promise<void> {
  await delay();
  const idx = mockTasks.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Not found');
  mockTasks.splice(idx, 1);
}