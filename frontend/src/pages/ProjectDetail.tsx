import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "../components/Breadcrumbs";
import { ROUTE_NAMES } from "../routes/constants";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  FORM_LABEL,
  OTHERS,
  SIDEBAR_OPTIONS,
  TASK_STATUS,
} from "../constants/App.constants";
import { getProjectById } from "../api/projects.service";
import { PROJECT_DETAIL_QUERY } from "../constants/Query.constants";
import TaskGrid from "../components/TaskGrid";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const [draft, setDraft] = useState({
    name: "",
    description: "",
  });

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
      (t: any) => t.status === TASK_STATUS.DONE,
    ).length;

    return Math.round((completed / total) * 100);
  }, [tasks]);

  if (isLoading) return <div>Loading project...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  if (!project)
    return <div className="text-muted">{ERR_MSG.PROJECT_NOT_FOUND}</div>;

  const startEdit = () => {
    setDraft({
      name: project.name || "",
      description: project.description || "",
    });

    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    // later call updateProject API
    setIsEditing(false);
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: SIDEBAR_OPTIONS.PROJECTS, href: ROUTE_NAMES.PROJECTS },
          { label: project.name ?? EMPTY_STRING },
        ]}
      />

      {/* ================= PROJECT HEADER ================= */}
      <section className="mt-4 bg-white border border-gray-200 rounded-lg p-6 flex justify-between gap-8">
        {/* LEFT */}
        <div className="flex flex-col gap-3 max-w-xl">
          {isEditing ? (
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((p) => ({ ...p, name: e.target.value }))
              }
              className="text-2xl font-semibold border border-gray-300 rounded-md px-2 py-1 w-full"
            />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-900">
              {project.name}
            </h2>
          )}

          {isEditing ? (
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((p) => ({ ...p, description: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
            />
          ) : (
            <p className="text-gray-600">{project.description}</p>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 flex gap-6 mt-2">
            <span>
              {FORM_LABEL.CREATED_BY}{" "}
              <span className="font-medium text-gray-700">
                {project.created_by?.name}
              </span>
            </span>

            <span>
              {FORM_LABEL.CREATED_ON}{" "}
              <span className="font-medium text-gray-700">
                {new Date(project?.created_at ?? "").toLocaleDateString()}
              </span>
            </span>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{OTHERS.PROGRESS}</span>
              <span className="font-medium">{progress}%</span>
            </div>

            <div className="w-64 bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-start gap-3">
          {isEditing ? (
            <>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                {BUTTON_NAMES.SAVE}
              </button>

              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                {BUTTON_NAMES.CANCEL}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEdit}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                {BUTTON_NAMES.EDIT_PROJECT}
              </button>

              <button className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700">
                {BUTTON_NAMES.ADD_TASK}
              </button>
            </>
          )}
        </div>
      </section>

      {/* ================= TASK LIST ================= */}
      <section className="mt-6 bg-card border border-border rounded-lg">
        {tasks.length === 0 ? (
          <div className="p-6 text-muted">{ERR_MSG.NO_TASKS}</div>
        ) : (
          <TaskGrid filteredTasks={tasks} showAssignee={true} />
        )}
      </section>
    </div>
  );
}
