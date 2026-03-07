import React from "react";
import { IProject } from "../types/project.type";
import { useNavigate } from "react-router-dom";
import { ROUTE_NAMES } from "../routes/constants";
import { EMPTY_STRING } from "../constants/App.constants";

export default function ProjectCard({ project }: { project: IProject }) {
  const navigate = useNavigate();

  function openProject(id: string) {
    navigate(ROUTE_NAMES.PROJECT(id));
  }

  const members = project.members ?? [];
  const visibleMembers = members.slice(0, 3);
  const remainingMembers = members.slice(3);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join(EMPTY_STRING)
      .slice(0, 2)
      .toUpperCase();
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
      <div className="flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-sm font-semibold">{project.title}</h3>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted line-clamp-3">
            {project.description}
          </p>
        )}
        <p className="text-xs text-muted">Owner: {project.created_by?.name}</p>

        {/* Bottom Row */}
        <div className="flex justify-between items-center mt-2">
          {/* Member Avatars */}
          <div className="flex -space-x-2">
            {visibleMembers.map((m) => (
              <div
                key={m.id}
                className="relative group"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white">
                  {getInitials(m.name)}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div>{m.name}</div>
                  <div className="text-gray-300">{m.email}</div>
                </div>
              </div>
            ))}

            {/* +N circle */}
            {remainingMembers.length > 0 && (
              <div
                className="relative group"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 text-xs flex items-center justify-center border-2 border-white">
                  +{remainingMembers.length}
                </div>

                {/* Tooltip listing remaining users */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded px-3 py-2 whitespace-nowrap">
                  {remainingMembers.map((m) => (
                    <div key={m.id}>{m.name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-xs text-muted">{members.length} members</span>

          {/* Created Date */}
          {project.created_at && (
            <span className="text-xs text-muted">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
