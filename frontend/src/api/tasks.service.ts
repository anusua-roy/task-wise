import { Task } from "../types/task.type";
import { http } from "./http";

export const getMyTasks = async () => {
  return http<Task[]>("/api/tasks/my");
};