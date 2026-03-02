import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "../components/Breadcrumbs";
import { ROUTE_NAMES } from "../routes/constants";
import {
  BUTTON_NAMES,
  ERR_MSG,
  OTHERS,
  SIDEBAR_OPTIONS,
  TASK_STATUS,
  TASK_TABLE,
} from "../constants/App.constants";
import { getProjectById } from "../api/projects.service";
import { PROJECT_DETAIL_QUERY } from "../constants/Query.constants";
import TaskGrid from "../components/TaskGrid";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: [PROJECT_DETAIL_QUERY, id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const tasks = project?.tasks ?? [];

  const progress = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return 0;
    const completed = tasks.filter(
      (t: any) => t.status === TASK_STATUS.DONE
    ).length;
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
            {`${OTHERS.PROGRESS} `}
            <span className="font-medium">{progress}%</span>
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
          <div className="flex-[3]">{TASK_TABLE.TITLE}</div>
          <div className="flex-[1]">{TASK_TABLE.STATUS}</div>
        </div>

        {tasks.length === 0 ? (
          <div className="p-4 text-muted">{ERR_MSG.NO_TASKS}</div>
        ) : (
          <TaskGrid tasks={tasks} />
        )}
      </section>
    </div>
  );
}
