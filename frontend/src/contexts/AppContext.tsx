// src/contexts/AppContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Task } from "../types/task.type";
import { User } from "../types/user.type";
import { IProject } from "../types/project.type";
import * as tasksApi from "../api/tasks.service";
import * as usersApi from "../api/users.service";
import * as projectsApi from "../api/projects.service";

interface AppContextType {
  tasks: Task[];
  users: User[];
  projects: IProject[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setProjects: React.Dispatch<React.SetStateAction<IProject[]>>;
  reloadTasks: () => Promise<void>;
  reloadUsers: () => Promise<void>;
  reloadProjects: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);

  // Reload functions
  const reloadTasks = async () => {
    if (!user) return;
    const data = await tasksApi.getMyTasks();
    setTasks(data);
  };

  const reloadUsers = async () => {
    if (!user) return;
    const data = await usersApi.getUsers();
    setUsers(data);
  };

  const reloadProjects = async () => {
    if (!user) return;
    const data = await projectsApi.getProjects();
    setProjects(data);
  };

  // Initial load when user is logged in
  useEffect(() => {
    if (user) {
      reloadTasks();
      reloadUsers();
      reloadProjects();
    } else {
      setTasks([]);
      setUsers([]);
      setProjects([]);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        tasks,
        users,
        projects,
        setTasks,
        setUsers,
        setProjects,
        reloadTasks,
        reloadUsers,
        reloadProjects,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
