import React, { useState } from "react";
import {
  EMPTY_STRING,
  TASK_STATUS,
  TASK_TABLE,
} from "../constants/App.constants";
import { Task } from "../types/task.type";
import StatusBadge from "./StatusBadge";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { updateTask, deleteTask } from "../api/tasks.service";
import toast from "react-hot-toast";
import { PROJECT_DETAIL_QUERY } from "../constants/Query.constants";
import { useAuth } from "../contexts/AuthContext";
import { isAdmin, isCreator } from "../utils/common";

interface Props {
  filteredTasks: Task[];
  showAssignee?: boolean;
  projectId?: string;
  members?: any[];
  onTaskUpdated?: () => void;
}

export default function TaskGrid({
  filteredTasks,
  showAssignee = false,
  projectId = EMPTY_STRING,
  members = [],
  onTaskUpdated,
}: Props) {
  const { user } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<any>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();

  const isReadOnly = user?.role === "Read-Only";

  // =========================
  // PERMISSIONS
  // =========================
  const canModify = () => {
    return isAdmin(user) || isCreator(user);
  };

  const canMarkComplete = (task: Task) => {
    if (!isReadOnly) return false;
    return task.assignees?.some((a) => a.id === user?.id);
  };

  // =========================
  // EDIT
  // =========================
  const startEdit = (task: Task) => {
    setEditingId(task.id);

    setDraft({
      title: task.title,
      description: task.description,
      status: task.status,
      assignees: task.assignees?.map((a) => a.id) || [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const handleChange = (field: string, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const existingTask = filteredTasks.find((t) => t.id === editingId);

    try {
      const payload: any = {
        title: draft.title,
        description: draft.description,
        status: draft.status,
      };

      /**
       * CRITICAL FIX
       *
       * - If assignees changed → use draft
       * - If NOT changed → preserve existing
       */
      if (draft.assignees !== undefined) {
        payload.assignees = draft.assignees;
      } else {
        payload.assignees = existingTask?.assignees?.map((a) => a.id) || [];
      }

      await updateTask(editingId, payload);

      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, projectId],
      });

      onTaskUpdated?.(); // sync parent (MyTasksPage)

      setEditingId(null);
      setDraft({});
      toast.success("Task updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update task");
    }
  };

  // =========================
  // DELETE
  // =========================
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTask(deleteId);

      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, projectId],
      });

      onTaskUpdated?.();

      toast.success("Task deleted");
      setDeleteId(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete task");
    }
  };

  // =========================
  // MARK COMPLETE
  // =========================
  const handleMarkComplete = async (task: Task) => {
    try {
      await updateTask(task.id, {
        status: TASK_STATUS.DONE,
      });

      queryClient.invalidateQueries({
        queryKey: [PROJECT_DETAIL_QUERY, projectId],
      });

      onTaskUpdated?.();

      toast.success("Task completed");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update task");
    }
  };

  return (
    <div className="w-full mt-4 border rounded-md overflow-hidden">
      {/* HEADER */}
      <div
        className={`grid ${
          showAssignee ? "grid-cols-7" : "grid-cols-6"
        } px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 border-b`}
      >
        <div className="col-span-2">{TASK_TABLE.TITLE}</div>
        <div className="col-span-2">{TASK_TABLE.DESCRIPTION}</div>
        <div>{TASK_TABLE.STATUS}</div>
        {showAssignee && <div>Assignee</div>}
        <div className="text-right">{TASK_TABLE.ACTION}</div>
      </div>

      {/* ROWS */}
      {filteredTasks.map((task) => {
        const isEditing = editingId === task.id;

        const assigneeId = task.assignees?.[0]?.id;
        const assigneeName = members.find((m) => m.id === assigneeId)?.name;

        return (
          <div
            key={task.id}
            className={`grid ${
              showAssignee ? "grid-cols-7" : "grid-cols-6"
            } items-center gap-x-4 px-4 py-3 border-b ${
              isEditing ? "bg-orange-50/40" : "hover:bg-gray-50"
            }`}
          >
            {/* TITLE */}
            <div className="col-span-2">
              {isEditing ? (
                <input
                  value={draft.title || EMPTY_STRING}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              ) : (
                <span>{task.title}</span>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="col-span-2">
              {isEditing ? (
                <input
                  value={draft.description || EMPTY_STRING}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              ) : (
                <span>{task.description}</span>
              )}
            </div>

            {/* STATUS */}
            <div>
              {isEditing ? (
                <select
                  value={draft.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  {Object.values(TASK_STATUS).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={task.status} />
              )}
            </div>

            {/* ASSIGNEE */}
            {showAssignee && (
              <div>
                {isEditing ? (
                  <select
                    value={draft.assignees?.[0] || EMPTY_STRING}
                    onChange={(e) =>
                      handleChange(
                        "assignees",
                        e.target.value ? [e.target.value] : [],
                      )
                    }
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{assigneeName || "Unassigned"}</span>
                )}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2">
              {canMarkComplete(task) && task.status !== TASK_STATUS.DONE && (
                <button
                  onClick={() => handleMarkComplete(task)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Complete
                </button>
              )}

              {/* ADMIN / CREATOR */}
              {canModify() && (
                <>
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit}>
                        <FiCheck />
                      </button>
                      <button onClick={cancelEdit}>
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(task)}>
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(task.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-4 rounded">
            <p>Delete this task?</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
