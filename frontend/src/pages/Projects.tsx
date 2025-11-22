// frontend/src/pages/Projects.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import { PROJECTS } from "../data/projects";
import { Project } from "../types/project.type";
import { ROUTE_NAMES } from "../routes/constants";
import { useForm } from "react-hook-form";

type FormValues = {
  title: string;
  description?: string;
  tags?: string; // comma separated
  repoUrl?: string;
  liveUrl?: string;
};

export default function Projects() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [items, setItems] = useState<Project[]>(PROJECTS);
  const [editing, setEditing] = useState<Project | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.description || "").toLowerCase().includes(t)
    );
  }, [q, items]);

  const [showForm, setShowForm] = useState(false);

  const onCreateClick = () => {
    reset({
      title: "",
      description: "",
      tags: "",
      repoUrl: "",
      liveUrl: "",
    });
    setShowForm(true);
  };

  const onSubmit = (data: FormValues) => {
    // minimal payload conversion; keep same Project shape you have
    const newProject: Project = {
      id: `p_${Math.random().toString(36).slice(2, 9)}`,
      title: data.title,
      description: data.description || "",
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      repoUrl: data.repoUrl || "",
      liveUrl: data.liveUrl || "",
      // fill optional fields conservatively
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    } as unknown as Project;

    setItems((s) => [newProject, ...s]);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects"
          className="w-full sm:w-64 p-2.5 rounded-lg border border-border bg-[color:var(--card-bg)] text-sm"
        />
        <button
          onClick={onCreateClick}
          className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
        >
          Add Project
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </section>

      {/* Modal: Add Project (matches Add Task style) */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow-xl w-full max-w-lg flex flex-col gap-3"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit Project" : "Create Project"}
          >
            <h2 className="text-xl font-semibold">
              {editing ? "Edit Project" : "New Project"}
            </h2>
            <div>
              <label className="block text-sm">Title</label>
              <input
                {...register("title", { required: true })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
              />
            </div>

            <div>
              <label className="block text-sm">Description</label>
              <textarea
                {...register("description")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Tags (comma separated)</label>
                <input
                  {...register("tags")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm">Repository URL</label>
                <input
                  {...register("repoUrl")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm">Live URL</label>
              <input
                {...register("liveUrl")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
