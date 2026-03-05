import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "../components/ProjectCard";
import { getProjects } from "../api/projects.service";
import { getMyTasks } from "../api/tasks.service";
import { useAuth } from "../contexts/AuthContext";
import {
  EMPTY_STRING,
  ERR_MSG,
  PAGE_LOADING,
  TASK_STATUS,
  TASK_TABLE,
  TITLES,
} from "../constants/App.constants";
import { MY_TASKS_QUERY, PROJECTS_QUERY } from "../constants/Query.constants";
import TaskGrid from "../components/TaskGrid";

export default function Dashboard() {

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: [PROJECTS_QUERY],
    queryFn: getProjects,
  });

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: [MY_TASKS_QUERY],
    queryFn: getMyTasks,
  });

  if (projectsLoading || tasksLoading) return <div>{PAGE_LOADING}</div>;

  if (projectsError instanceof Error)
    return <div>{`${ERR_MSG.PROJECTS_LOADING} ${projectsError.message}`}</div>;

  if (tasksError instanceof Error)
    return <div>{`${ERR_MSG.TASKS_LOADING} ${tasksError.message}`}</div>;

  return (
    <div>
      {/* ========================= */}
      {/* My Projects */}
      {/* ========================= */}
      <div className="cards-row" role="list">
        {(projects ?? []).map((proj: any) => (
          <ProjectCard
            key={proj.id}
            project={{
              id: proj.id,
              title: proj.name,
              description: proj.description ?? EMPTY_STRING,
              tags: [],
              created_at: proj.created_at,
            }}
          />
        ))}
      </div>

      {/* ========================= */}
      {/* My Tasks */}
      {/* ========================= */}
      <section style={{ marginTop: 32 }}>
        <h2>{TITLES.MY_TASKS}</h2>

        {(tasks ?? []).length === 0 ? (
          <p style={{ marginTop: 12 }}>{ERR_MSG.NO_TASKS}</p>
        ) : (
          <TaskGrid tasks={tasks ?? []} />
        )}
      </section>
    </div>
  );
}
