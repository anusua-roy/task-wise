import { Task } from "./task.type";
export type Project = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  owner?: string;
  tasks: Task[];
  createdAt?: string;
};
