import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "../components/Breadcrumbs";
import { ROUTE_NAMES } from "../routes/constants";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  FORM_LABEL,
  SIDEBAR_OPTIONS,
  TASK_STATUS,
} from "../constants/App.constants";
import {
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "../api/projects.service";
import { getUsersLookup } from "../api/users.service";
import { createTask } from "../api/tasks.service";
import toast from "react-hot-toast";
import { PROJECT_DETAIL_QUERY } from "../constants/Query.constants";
import TaskGrid from "../components/TaskGrid";
import { useAuth } from "../contexts/AuthContext";
import { TaskStatus } from "../types/task.type";
import { isAdmin, canCreateTask } from "../utils/common";

export default function ProjectDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

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

  // =========================
  // FETCH PROJECT
  // =========================
  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: [PROJECT_DETAIL_QUERY, id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users-lookup"],
    queryFn: getUsersLookup,
  });

  const tasks = project?.tasks ?? [];
  const members = project?.members ?? [];

  // =========================
  // EDIT HANDLERS
  // =========================
  const startEdit = () => {
    setDraft({
      name: project?.name || EMPTY_STRING,
      description: project?.description || EMPTY_STRING,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      updateProject(id!, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, id],
      });
      toast.success("Project updated");
      setIsEditing(false);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => addProjectMember(id!, userId),
    onSuccess: () => {
      toast.success("Member added");
      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, id],
      });
      setShowMemberModal(false);
      setSelectedUser("");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeProjectMember(id!, userId),
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, id],
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Cannot remove member");
    },
  });

  const saveEdit = () => {
    updateMutation.mutate({
      name: draft.name,
      description: draft.description,
    });
  };

  // =========================
  // DELETE
  // =========================
  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id!),
    onSuccess: () => {
      toast.success("Project deleted");
      navigate(ROUTE_NAMES.PROJECTS);
    },
  });

  // =========================
  // CREATE TASK
  // =========================
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, id],
      });
      toast.success("Task created");
      setShowTaskForm(false);
      setTaskDraft({
        title: EMPTY_STRING,
        description: EMPTY_STRING,
        assignees: EMPTY_STRING,
      });
    },
  });

  const handleCreateTask = () => {
    createTaskMutation.mutate({
      title: taskDraft.title,
      description: taskDraft.description,
      project_id: id,
      status: TASK_STATUS.NEW as TaskStatus,
      assignees: taskDraft.assignees ? [taskDraft.assignees] : [],
    });
  };

  // =========================
  // PROGRESS
  // =========================
  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t: any) => t.status === TASK_STATUS.DONE).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>{error.message}</div>;
  if (!project) return <div>{ERR_MSG.PROJECT_NOT_FOUND}</div>;

  const canEdit = isAdmin(user) || project?.created_by?.id === user?.id;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: SIDEBAR_OPTIONS.PROJECTS, href: ROUTE_NAMES.PROJECTS },
          { label: project.name as string },
        ]}
      />

      {/* HEADER */}
      <section className="mt-4 bg-white border rounded-lg p-6 flex justify-between">
        <div className="max-w-xl">
          {isEditing ? (
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((p) => ({ ...p, name: e.target.value }))
              }
              className="text-2xl border px-2 py-1 w-full"
            />
          ) : (
            <h2 className="text-2xl font-semibold">{project.name}</h2>
          )}

          {isEditing ? (
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((p) => ({ ...p, description: e.target.value }))
              }
              className="mt-2 border px-2 py-1 w-full"
            />
          ) : (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}

          <div className="text-sm text-gray-500 mt-2">
            Members: {members.length}
            {canEdit && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="ml-3 text-xs text-orange-600 hover:underline"
              >
                Manage
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm"
              >
                {m.name}

                {canEdit && (
                  <button
                    onClick={() => {
                      setRemoveMemberId(m.id);
                      setShowRemoveModal(true);
                    }}
                    className="text-red-500 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 text-sm">Progress: {progress}%</div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-start gap-3">
          {isEditing ? (
            <>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
              <button onClick={cancelEdit} className="px-4 py-2 border rounded">
                Cancel
              </button>
            </>
          ) : (
            canEdit && (
              <>
                <button
                  onClick={startEdit}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  {BUTTON_NAMES.EDIT_PROJECT}
                </button>

                <button
                  onClick={() => setShowDeleteProjectModal(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )
          )}

          {canCreateTask(user) && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              Add Task
            </button>
          )}
        </div>
      </section>

      {/* TASKS */}
      <section className="mt-6">
        <TaskGrid
          filteredTasks={tasks}
          showAssignee={true}
          projectId={id}
          members={members}
        />
      </section>

      {/* CREATE TASK MODAL */}
      {showTaskForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-5 rounded w-full max-w-md">
            <h2 className="text-lg font-semibold">Create Task</h2>

            <input
              value={taskDraft.title}
              onChange={(e) =>
                setTaskDraft((p) => ({ ...p, title: e.target.value }))
              }
              className="border p-2 w-full mt-2"
            />

            <textarea
              value={taskDraft.description}
              onChange={(e) =>
                setTaskDraft((p) => ({ ...p, description: e.target.value }))
              }
              className="border p-2 w-full mt-2"
            />

            <select
              value={taskDraft.assignees}
              onChange={(e) =>
                setTaskDraft((p) => ({
                  ...p,
                  assignees: e.target.value,
                }))
              }
              className="border p-2 w-full mt-2"
            >
              <option value="">Unassigned</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowTaskForm(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-5 rounded w-full max-w-md">
            <h2 className="text-lg font-semibold">Add Member</h2>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 w-full mt-3"
            >
              <option value="">Select user</option>

              {allUsers
                .filter((u: any) => !members.some((m: any) => m.id === u.id))
                .map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => addMemberMutation.mutate(selectedUser)}
                disabled={!selectedUser}
                className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Remove Member
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to remove this member? Active tasks must be
              reassigned first.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setRemoveMemberId(null);
                }}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                {BUTTON_NAMES.CANCEL}
              </button>

              <button
                onClick={() => {
                  if (removeMemberId) {
                    removeMemberMutation.mutate(removeMemberId);
                  }
                  setShowRemoveModal(false);
                  setRemoveMemberId(null);
                }}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteProjectModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Project
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete the project and all tasks.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowDeleteProjectModal(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                {BUTTON_NAMES.CANCEL}
              </button>

              <button
                onClick={() => {
                  deleteMutation.mutate();
                  setShowDeleteProjectModal(false);
                }}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                {BUTTON_NAMES.DELETE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
