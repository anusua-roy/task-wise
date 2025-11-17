import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import { PROJECTS } from "../data/projects";
import { Task } from "../types/task";
import { ROUTE_NAMES } from "../routes/constants";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // find project from mock data
  const project = useMemo(
    () => PROJECTS.find((p) => p.id === id) || null,
    [id]
  );

  // local tasks state so we can toggle/add without mutating the mock directly
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (project) {
      // deep copy tasks (defensive)
      setTasks((project.tasks || []).map((t) => ({ ...t })));
    } else {
      setTasks([]);
    }
  }, [project]);

  // recompute progress from status
  const progress = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return 0;
    const completed = tasks.filter((t) => t.status === "done").length;
    return Math.round((completed / total) * 100);
  }, [tasks]);

  function addTask() {
    const title = prompt("Task title");
    if (!title) return;
    const newTask: Task = {
      id: `t_${Date.now()}`,
      title,
      assignee: undefined,
      status: "todo",
      due: undefined,
      priority: "medium",
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function formatTaskStatus(status: string) {
    if (status === "todo") return "To Do";
    if (status === "inprogress") return "In Progress";
    if (status === "done") return "Done";
    return status;
  }

  if (!project) {
    return <div className="text-muted">Project not found.</div>;
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Projects", href: ROUTE_NAMES.PROJECTS },
          { label: project.title },
        ]}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{project.title}</h2>
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

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-orange-600 text-white"
            onClick={addTask}
          >
            Add Task
          </button>
        </div>
      </div>

      <section className="bg-card border border-border rounded-lg">
        {/* header */}
        <div className="hidden md:flex font-semibold px-4 py-3 border-b border-border text-sm">
          <div className="flex-[3]">Title</div>
          <div className="flex-[1]">Assignee</div>
          <div className="flex-[1]">Status</div>
          <div className="flex-[1]">Due</div>
        </div>

        {tasks.length === 0 ? (
          <div className="p-4 text-muted">No tasks yet.</div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="px-4 py-3 border-b border-border hover:bg-slate-50 cursor-pointer flex flex-col md:flex-row md:items-center gap-2 md:gap-0 transition"
            >
              {/* Title + mobile metadata */}
              <div className="flex-[3]">
                <div className="font-medium text-sm">{t.title}</div>
                <div className="text-xs text-muted md:hidden mt-1">
                  {t.assignee ?? "Unassigned"} • {formatTaskStatus(t.status)} •{" "}
                  {t.due ?? "No due date"}
                </div>
              </div>

              {/* Assignee */}
              <div className="flex-[1] hidden md:block text-sm text-muted">
                {t.assignee ?? "—"}
              </div>

              {/* Status badge */}
              <div className="flex-[1] hidden md:block">
                <span
                  className={
                    "px-2 py-1 text-xs rounded-md " +
                    (t.status === "done"
                      ? "bg-green-100 text-green-700"
                      : t.status === "inprogress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-slate-100 text-slate-800")
                  }
                >
                  {formatTaskStatus(t.status)}
                </span>
              </div>

              {/* Due date */}
              <div className="flex-[1] hidden md:block text-sm text-muted">
                {t.due ?? "—"}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
