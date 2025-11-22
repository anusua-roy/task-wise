import { Task } from "./task.type";
export interface IProject {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  owner?: string;
  tasks: Task[];
  createdAt?: string;
};
