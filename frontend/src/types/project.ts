import { Task } from "./task";
export type Project = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  owner?: string;
  tasks: Task[];
  createdAt?: string;
};
