import React, { useState } from "react";
import { TASK_STATUS, TASK_TABLE } from "../constants/App.constants";
import { Task } from "../types/task.type";
import StatusBadge from "./StatusBadge";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useAppContext } from "../contexts/AppContext";
import * as tasksApi from "../api/tasks.service";
import toast from "react-hot-toast";

interface Props {
  filteredTasks: Task[];
  showAssignee?: boolean; // only true in ProjectDetail
}

export default function TaskGrid({
  filteredTasks,
  showAssignee = false,
}: Props) {
  const { tasks, users, setTasks } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Task>>({});

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setDraft(task);
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
      // const updatedTask = await tasksApi.updateTask(editingId, draft);
      // // Update context tasks (full list)
      // setTasks((prev) =>
      //   prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      // );
      // setEditingId(null);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete task?")) return;
    try {
      // await tasksApi.deleteTask(id);
      // setTasks((prev) => prev.filter((t) => t.id !== id));
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
                  value={draft.title || ""}
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
                  value={draft.description || ""}
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
                    value={draft.assignees?.[0].id || ""}
                    onChange={(e) =>
                      handleChange(
                        "assignee",
                        users.find((u) => u.id === e.target.value),
                      )
                    }
                    className="w-full mx-1 h-9 px-2 text-sm border border-gray-300 rounded-md
                               bg-white focus:outline-none focus:ring-2
                               focus:ring-orange-500/30 focus:border-orange-500 transition"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-700">
                    {task.assignees?.[0].name || "Unassigned"}
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
                    onClick={() => handleDelete(task.id)}
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
    </div>
  );
}
