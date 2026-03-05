import { Task } from "./task.type";
import { User } from "./user.type";
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
  created_by?: User;
  members?: User[];
}
