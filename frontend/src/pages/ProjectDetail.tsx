import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "../components/Breadcrumbs";
import { ROUTE_NAMES } from "../routes/constants";
import {
  BUTTON_NAMES,
  ERR_MSG,
  SIDEBAR_OPTIONS,
} from "../constants/App.constants";
import { getProjectById } from "../api/projects.service";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project-detail", id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const tasks = project?.tasks ?? [];

  const progress = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return 0;
    const completed = tasks.filter((t: any) => t.status === "Done").length;
    return Math.round((completed / total) * 100);
  }, [tasks]);

  if (isLoading) return <div>Loading project...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  if (!project)
    return <div className="text-muted">{ERR_MSG.PROJECT_NOT_FOUND}</div>;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: SIDEBAR_OPTIONS.PROJECTS, href: ROUTE_NAMES.PROJECTS },
          { label: project.title },
        ]}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{project.name}</h2>
          <p className="text-muted mt-2">{project.description}</p>

          <div className="mt-3 text-sm text-muted">
            Progress: <span className="font-medium">{progress}%</span>
          </div>

          <div className="w-48 bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-orange-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Task button later wired to modal */}
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-orange-600 text-white">
            {BUTTON_NAMES.ADD_TASK}
          </button>
        </div>
      </div>

      {/* ================= TASK LIST ================= */}
      <section className="bg-card border border-border rounded-lg">
        <div className="hidden md:flex font-semibold px-4 py-3 border-b border-border text-sm">
          <div className="flex-[3]">Title</div>
          <div className="flex-[1]">Status</div>
        </div>

        {tasks.length === 0 ? (
          <div className="p-4 text-muted">{ERR_MSG.NO_TASKS}</div>
        ) : (
          tasks.map((t: any) => (
            <div
              key={t.id}
              className="px-4 py-3 border-b border-border hover:bg-slate-50 transition"
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm">{t.title}</div>

                <span
                  className={
                    "px-2 py-1 text-xs rounded-md " +
                    (t.status === "Done"
                      ? "bg-green-100 text-green-700"
                      : t.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : t.status === "Blocked"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-800")
                  }
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
