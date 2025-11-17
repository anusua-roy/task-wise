import React from "react";

export default function ProjectCard({
  project,
  onOpen,
}: {
  project: { id: string; title: string; description?: string; progress?: number };
  onOpen?: (id: string) => void;
}) {
  return (
    <article
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(project.id)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen?.(project.id); }}
      aria-label={project.title}
    >
      <div className="flex justify-between items-start">
        <div className="pr-2">
          <h3 className="text-sm font-semibold">{project.title}</h3>
          <p className="mt-2 text-muted text-xs line-clamp-3">{project.description}</p>
        </div>
        <div className="text-sm text-muted">{project.progress ?? 0}%</div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-600"
            style={{ width: `${project.progress ?? 6}%` }}
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
