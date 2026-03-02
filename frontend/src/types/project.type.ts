import { Task } from "./task.type";
export interface IProject {
  id: string;
  title: string;
  name?: string;
  description?: string;
  tags?: string[];
  owner?: string;
  tasks?: Task[];
  created_at?: string;
  updated_at?: string;
}
