import React, { useState } from "react";
import { BUTTON_NAMES, EMPTY_STRING, TASK_STATUS, TASK_TABLE } from "../constants/App.constants";
import { Task } from "../types/task.type";
import StatusBadge from "./StatusBadge";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useAppContext } from "../contexts/AppContext";
import { useQueryClient } from "@tanstack/react-query";
import { updateTask, deleteTask } from "../api/tasks.service";
import toast from "react-hot-toast";
import { PROJECT_DETAIL_QUERY } from "../constants/Query.constants";

interface Props {
  filteredTasks: Task[];
  showAssignee?: boolean; // only true in ProjectDetail
  projectId?: string;
}

export default function TaskGrid({
  filteredTasks,
  showAssignee = false,
  projectId = EMPTY_STRING,
}: Props) {
  const { users } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<any>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();
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

    try {
      const payload = {
        title: draft.title,
        description: draft.description,
        status: draft.status,
        assignees: draft.assignees ?? [],
      };

      await updateTask(editingId, payload);

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [PROJECT_DETAIL_QUERY, projectId],
        });
      }

      setEditingId(null);
      setDraft({});
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

 const confirmDelete = async () => {
   if (!deleteId) return;

   try {
     await deleteTask(deleteId);

     if (projectId) {
       queryClient.invalidateQueries({
         queryKey: [PROJECT_DETAIL_QUERY, projectId],
       });
     }

     toast.success("Task deleted");

     setDeleteId(null);
     setShowDeleteConfirm(false);
   } catch {
     toast.error("Failed to delete task");
   }
 };
  return (
    <div className="w-full mt-4 border rounded-md overflow-hidden">
      {/* Header */}
      <div
        className={`grid ${showAssignee ? "grid-cols-7" : "grid-cols-6"} px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 border-b`}
      >
        <div className="col-span-2">{TASK_TABLE.TITLE}</div>
        <div className="col-span-2">{TASK_TABLE.DESCRIPTION}</div>
        <div>{TASK_TABLE.STATUS}</div>
        {showAssignee && <div>Assignee</div>}
        <div className="text-right">{TASK_TABLE.ACTION}</div>
      </div>

      {/* Rows */}
      {filteredTasks.map((task) => {
        const isEditing = editingId === task.id;

        return (
          <div
            key={task.id}
            className={`grid ${showAssignee ? "grid-cols-7" : "grid-cols-6"} items-center gap-x-4 px-4 py-3 border-b transition-colors duration-150
              ${isEditing ? "bg-orange-50/40" : "hover:bg-gray-50"}`}
          >
            {/* TITLE */}
            <div className="col-span-2">
              {isEditing ? (
                <input
                  value={draft.title || EMPTY_STRING}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full mx-1 h-9 px-3 text-sm border border-gray-300 rounded-md
                             bg-white focus:outline-none focus:ring-2
                             focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              ) : (
                <span className="font-medium text-gray-800">{task.title}</span>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="col-span-2">
              {isEditing ? (
                <input
                  value={draft.description || EMPTY_STRING}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full mx-1 h-9 px-3 text-sm border border-gray-300 rounded-md
                             bg-white focus:outline-none focus:ring-2
                             focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {task.description}
                </span>
              )}
            </div>

            {/* STATUS */}
            <div>
              {isEditing ? (
                <select
                  value={draft.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full mx-1 h-9 px-3 text-sm border border-gray-300 rounded-md
                             bg-white focus:outline-none focus:ring-2
                             focus:ring-orange-500/30 focus:border-orange-500 transition"
                >
                  <option value={TASK_STATUS.NEW}>{TASK_STATUS.NEW}</option>
                  <option value={TASK_STATUS.IN_PROGRESS}>
                    {TASK_STATUS.IN_PROGRESS}
                  </option>
                  <option value={TASK_STATUS.BLOCKED}>
                    {TASK_STATUS.BLOCKED}
                  </option>
                  <option value={TASK_STATUS.DONE}>{TASK_STATUS.DONE}</option>
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
                    className="w-full mx-1 h-9 px-2 text-sm border border-gray-300 rounded-md
                               bg-white focus:outline-none focus:ring-2
                               focus:ring-orange-500/30 focus:border-orange-500 transition"
                  >
                    <option value={EMPTY_STRING}>Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-700">
                    {task.assignees?.[0]?.name || "Unassigned"}
                  </span>
                )}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="flex items-center justify-center h-9 w-9 text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition"
                  >
                    <FiCheck size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center justify-center h-9 w-9 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                  >
                    <FiX size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(task)}
                    className="flex items-center justify-center h-9 w-9 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="flex items-center justify-center h-9 w-9 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>

            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                {BUTTON_NAMES.CANCEL}
              </button>

              <button
                onClick={confirmDelete}
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
