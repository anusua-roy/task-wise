import React from "react";
import { PROJECT_TYPE } from "../types/project.type";
import { useNavigate } from "react-router-dom";
import { ROUTE_NAMES } from "../routes/constants";

export default function ProjectCard({ project }: { project: PROJECT_TYPE }) {
  const navigate = useNavigate();

  const tasks = project.tasks ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  function openProject(id: string) {
    navigate(ROUTE_NAMES.PROJECT(id));
  }
  return (
    <article
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => openProject(project.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") openProject(project.id);
      }}
      aria-label={project.title}
    >
      <div className="flex justify-between items-start">
        <div className="pr-2">
          <h3 className="text-sm font-semibold">{project.title}</h3>
          <p className="mt-2 text-muted text-xs line-clamp-3">
            {project.description}
          </p>
        </div>
        <div className="text-sm text-muted">{progress ?? 0}%</div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-600"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
