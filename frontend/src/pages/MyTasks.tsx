// src/pages/MyTasks.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Task } from "../types/task.type";
import * as tasksApi from "../api/tasks.service";
import TaskCard from "../components/TaskCard";
import TaskFilters from "../components/TaskFilters";

type FormValues = {
  title: string;
  description?: string;
  status?: Task["status"];
  tags?: string;
  dueDate?: string;
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Task["status"]>(
    "all"
  );
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await tasksApi.getMyTasks();
        setTasks(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => s.add(tag)));
    return Array.from(s);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (tagFilter && !(t.tags || []).includes(tagFilter)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (t.title + " " + (t.description || ""))
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [tasks, statusFilter, tagFilter, query]);

  const onClear = () => {
    setQuery("");
    setStatusFilter("all");
    setTagFilter(undefined);
  };

  const onCreateClick = () => {
    reset({
      title: "",
      description: "",
      status: "todo",
      tags: "",
      dueDate: "",
    });
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (task: Task) => {
    setEditing(task);
    reset({
      title: task.title,
      description: task.description || "",
      status: task.status,
      tags: (task.tags || []).join(", "),
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await tasksApi.deleteTask(id);
      setTasks((s) => s.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const onStatusChange = async (id: string, status: Task["status"]) => {
    try {
      const updated = await tasksApi.updateTask(id, { status });
      setTasks((s) => s.map((t) => (t.id === id ? updated : t)));
    } catch {
      alert("Failed to update status");
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editing) {
        const updated = await tasksApi.updateTask(editing.id, {
          title: data.title,
          description: data.description,
          status: data.status,
          tags: data.tags
            ? data.tags
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
          dueDate: data.dueDate || null,
        });
        setTasks((s) => s.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await tasksApi.createTask({
          title: data.title,
          description: data.description,
          status: data.status,
          tags: data.tags
            ? data.tags
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
          dueDate: data.dueDate || null,
        });
        setTasks((s) => [created, ...s]);
      }
      setShowForm(false);
    } catch {
      alert("Failed to save");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3 gap-3">
        <TaskFilters
          query={query}
          setQuery={setQuery}
          status={statusFilter}
          setStatus={setStatusFilter}
          tagOptions={tagOptions}
          selectedTag={tagFilter}
          setSelectedTag={setTagFilter}
          onClear={onClear}
        />
        <button
          onClick={onCreateClick}
          className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
        >
          Add Task
        </button>
      </div>

      {loading && <p>Loading tasks…</p>}
      {error && (
        <p className="text-red-600" role="alert">
          Error: {error}
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="p-6 text-center text-gray-600 border border-dashed border-gray-300 rounded">
          No tasks match — try clearing filters or create a new task.
        </div>
      )}

      {/* Task Grid */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4"
        aria-live="polite"
      >
        {filtered.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </section>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow-xl w-full max-w-lg flex flex-col gap-3"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit task" : "Create task"}
          >
            <h2 className="text-xl font-semibold">
              {editing ? "Edit Task" : "New Task"}
            </h2>

            <label className="flex flex-col gap-1 text-sm">
              Title
              <input
                {...register("title", { required: true })}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Description
              <textarea
                {...register("description")}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Status
              <select
                {...register("status")}
                className="border border-gray-300 rounded px-2 py-2"
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Tags (comma separated)
              <input
                {...register("tags")}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Due date
              <input
                type="date"
                {...register("dueDate")}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
