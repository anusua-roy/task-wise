// frontend/src/pages/Projects.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import { PROJECTS } from "../data/projects";
import { IProject } from "../types/project.type";
import { ROUTE_NAMES } from "../routes/constants";
import { useForm } from "react-hook-form";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  FORM_LABEL,
} from "../constants/App.constants";

type FormValues = {
  title: string;
  description?: string;
  tags?: string; // comma separated
  repoUrl?: string;
  liveUrl?: string;
};

export default function Projects() {
  const [q, setQ] = useState(EMPTY_STRING);
  const navigate = useNavigate();
  const [items, setItems] = useState<IProject[]>(PROJECTS);
  const [editing, setEditing] = useState<IProject | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.description || EMPTY_STRING).toLowerCase().includes(t)
    );
  }, [q, items]);

  const [showForm, setShowForm] = useState(false);

  const onCreateClick = () => {
    reset({
      title: EMPTY_STRING,
      description: EMPTY_STRING,
      tags: EMPTY_STRING,
      repoUrl: EMPTY_STRING,
      liveUrl: EMPTY_STRING,
    });
    setShowForm(true);
  };

  const onSubmit = (data: FormValues) => {
    // minimal payload conversion; keep same Project shape you have
    const newProject: IProject = {
      id: `p_${Math.random().toString(36).slice(2, 9)}`,
      title: data.title,
      description: data.description || EMPTY_STRING,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      repoUrl: data.repoUrl || EMPTY_STRING,
      liveUrl: data.liveUrl || EMPTY_STRING,
      // fill optional fields conservatively
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    } as unknown as IProject;

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
          {BUTTON_NAMES.ADD_PROJECT}
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
            aria-label={
              editing ? BUTTON_NAMES.EDIT_PROJECT : BUTTON_NAMES.CREATE_PROJECT
            }
          >
            <h2 className="text-xl font-semibold">
              {editing
                ? BUTTON_NAMES.EDIT_PROJECT
                : BUTTON_NAMES.CREATE_PROJECT}
            </h2>
            <div>
              <label className="block text-sm">{FORM_LABEL.TITLE}</label>
              <input
                {...register("title", { required: true })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
              />
            </div>

            <div>
              <label className="block text-sm">{FORM_LABEL.DESCRIPTION}</label>
              <textarea
                {...register("description")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">{FORM_LABEL.TAGS}</label>
                <input
                  {...register("tags")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm">{FORM_LABEL.REPO_URL}</label>
                <input
                  {...register("repoUrl")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm">{FORM_LABEL.LIVE_URL}</label>
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
                {BUTTON_NAMES.CANCEL}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                {BUTTON_NAMES.CREATE}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
