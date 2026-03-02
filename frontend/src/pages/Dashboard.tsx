import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "../components/ProjectCard";
import { getProjects } from "../api/projects.service";
import { getMyTasks } from "../api/tasks.service";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: getMyTasks,
  });

  if (projectsLoading || tasksLoading) return <div>Loading dashboard...</div>;

  if (projectsError instanceof Error)
    return <div>Error loading projects: {projectsError.message}</div>;

  if (tasksError instanceof Error)
    return <div>Error loading tasks: {tasksError.message}</div>;

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
              description: proj.description ?? "",
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
        <h2>My Tasks</h2>

        {(tasks ?? []).length === 0 ? (
          <p style={{ marginTop: 12 }}>No tasks assigned to you.</p>
        ) : (
          <div className="table" style={{ marginTop: 12 }}>
            <div className="row" style={{ fontWeight: 600 }}>
              <div style={{ flex: 2 }}>Title</div>
              <div style={{ flex: 2 }}>Description</div>
              <div style={{ flex: 1 }}>Status</div>
            </div>

            {(tasks ?? []).map((task: any) => (
              <div className="row" key={task.id}>
                <div style={{ flex: 2 }}>{task.title}</div>
                <div style={{ flex: 1 }}>{task.description}</div>
                <div style={{ flex: 1 }}>{task.status}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
