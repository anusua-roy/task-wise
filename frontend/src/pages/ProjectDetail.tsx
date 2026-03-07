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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectById, updateProject } from "../api/projects.service";
import { createTask } from "../api/tasks.service";
import toast from "react-hot-toast";
import { PROJECT_DETAIL_QUERY } from "../constants/Query.constants";
import TaskGrid from "../components/TaskGrid";
import { useAuth } from "../contexts/AuthContext";
import { TaskStatus } from "../types/task.type";
import { useAppContext } from "../contexts/AppContext";

export default function ProjectDetail() {
  const { user } = useAuth();
  const { users } = useAppContext();
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [draft, setDraft] = useState({
    name: EMPTY_STRING,
    description: EMPTY_STRING,
  });
  const [taskDraft, setTaskDraft] = useState({
    title: EMPTY_STRING,
    description: EMPTY_STRING,
    assignees: EMPTY_STRING,
  });

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, id],
      });

      toast.success("Task created successfully");

      setShowTaskForm(false);

      setTaskDraft({
        title: EMPTY_STRING,
        description: EMPTY_STRING,
        assignees: EMPTY_STRING,
      });
    },

    onError: (err: any) => {
      toast.error(err?.message || "Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      updateProject(id!, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, id],
      });

      toast.success("Project updated successfully");
      setIsEditing(false);
    },

    onError: (err: any) => {
      toast.error(err?.message || "Failed to update project");
    },
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
      name: project.name || EMPTY_STRING,
      description: project.description || EMPTY_STRING,
    });

    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    updateMutation.mutate({
      name: draft.name,
      description: draft.description,
    });
  };

  const handleCreateTask = () => {
    createTaskMutation.mutate({
      title: taskDraft.title,
      description: taskDraft.description,
      project_id: id,
      status: TASK_STATUS.NEW as TaskStatus,
      assignees: taskDraft.assignees ? [taskDraft.assignees] : [],
    });
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
                {new Date(
                  project?.created_at ?? EMPTY_STRING,
                ).toLocaleDateString()}
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
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {updateMutation.isPending ? OTHERS.SAVING : BUTTON_NAMES.SAVE}
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
              {project.created_by?.id === user?.id && (
                <button
                  onClick={startEdit}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  {BUTTON_NAMES.EDIT_PROJECT}
                </button>
              )}

              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700"
              >
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
          <TaskGrid filteredTasks={tasks} showAssignee={true} projectId={id} />
        )}
      </section>

      {showTaskForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Create Task</h2>

            <div>
              <label className="block text-sm">{FORM_LABEL.TITLE}</label>
              <input
                value={taskDraft.title}
                onChange={(e) =>
                  setTaskDraft((p) => ({ ...p, title: e.target.value }))
                }
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm">{FORM_LABEL.DESCRIPTION}</label>
              <textarea
                value={taskDraft.description}
                onChange={(e) =>
                  setTaskDraft((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm">Assign To</label>

              <select
                value={taskDraft.assignees}
                onChange={(e) =>
                  setTaskDraft((p) => ({
                    ...p,
                    assignees: e.target.value,
                  }))
                }
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              >
                <option value={EMPTY_STRING}>Unassigned</option>
                {users?.map((member: any) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowTaskForm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {BUTTON_NAMES.CANCEL}
              </button>

              <button
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-60"
              >
                {createTaskMutation.isPending
                  ? OTHERS.CREATING
                  : BUTTON_NAMES.CREATE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
