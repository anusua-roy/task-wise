import { Task, TaskPayload } from "../types/task.type";
import { http } from "./http";

export const getMyTasks = async () => {
  return http<Task[]>("/api/tasks/my");
};

export function createTask(data: TaskPayload) {
  return http<Task>("/api/tasks/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const updateTask = (id: string, data: any) =>
  http<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteTask = (id: string) =>
  http(`/api/tasks/${id}`, {
    method: "DELETE",
  });