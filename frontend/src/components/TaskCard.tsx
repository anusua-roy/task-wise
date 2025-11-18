import React from "react";
import { Task } from "../types/task.type";

interface Props {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task["status"]) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;

  return (
    <article
      className="rounded-lg p-3 bg-white shadow-sm border border-black/5 flex flex-col gap-2"
      aria-labelledby={`task-${task.id}-title`}
      role="article"
    >
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h3 id={`task-${task.id}-title`} className="text-base font-semibold">
          {task.title}
        </h3>

        <div className="flex gap-2 items-center">
          <span
            className={[
              "text-xs px-2 py-1 rounded capitalize font-medium",
              task.status === "todo" && "bg-indigo-50 text-indigo-700",
              task.status === "in-progress" && "bg-yellow-50 text-yellow-700",
              task.status === "blocked" && "bg-red-50 text-red-700",
              task.status === "done" && "bg-green-50 text-green-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {task.status.replace("-", " ")}
          </span>

          {due && <time dateTime={task.dueDate ?? undefined}>Due {due}</time>}
        </div>
      </header>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600">{task.description}</p>
      )}

      {/* Footer */}
      <footer
        className="
          flex justify-between items-center gap-3 
          max-[520px]:flex-col max-[520px]:items-start
        "
      >
        {/* Tags & Assignee */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {task.tags?.slice(0, 3).map((t) => (
            <small key={t} className="bg-black/5 px-2 py-1 rounded text-xs">
              {t}
            </small>
          ))}

          {task.assignee && (
            <small className="text-xs text-gray-500">
              👤 {task.assignee.name}
            </small>
          )}
        </div>

        {/* Actions */}
        <div
          className="
            flex items-center gap-2 
            max-[520px]:w-full max-[520px]:justify-start
          "
        >
          <select
            aria-label={`Change status for ${task.title}`}
            value={task.status}
            onChange={(e) =>
              onStatusChange?.(task.id, e.target.value as Task["status"])
            }
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>

          <button
            type="button"
            onClick={() => onEdit?.(task)}
            className="text-blue-600 hover:underline text-sm"
            aria-label={`Edit ${task.title}`}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(task.id)}
            className="text-red-600 hover:underline text-sm"
            aria-label={`Delete ${task.title}`}
          >
            Delete
          </button>
        </div>
      </footer>
    </article>
  );
}
