// frontend/src/pages/Projects.tsx
import React, { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { IProject } from "../types/project.type";
import { useForm } from "react-hook-form";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  FORM_LABEL,
  OTHERS,
  PAGE_LOADING,
  PLACEHOLDERS,
} from "../constants/App.constants";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getProjects, createProject } from "../api/projects.service";
import { PROJECTS_QUERY } from "../constants/Query.constants";
import toast from "react-hot-toast";

type FormValues = {
  title: string;
  description?: string;
  tags?: string;
};

export default function Projects() {
  const [q, setQ] = useState(EMPTY_STRING);
  const [editing, setEditing] = useState<IProject | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProject,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY] });

      setShowForm(false); // close modal
      reset(); // reset form

      toast.success("Project created successfully");
    },

    onError: (error: any) => {
      toast.error(error?.message || "Failed to create project");
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [PROJECTS_QUERY],
    queryFn: getProjects,
  });
  // const mutation = useMutation({
  //   mutationFn: createProject,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["projects"] });
  //   },
  // });

  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [showForm, setShowForm] = useState(false);

  const backendProjects = data ?? [];

  const items: IProject[] = backendProjects.map((p) => ({
    id: p.id,
    title: p.name ?? EMPTY_STRING,
    name: p.name,
    description: p.description ?? EMPTY_STRING,
    tags: [],
    created_at: p.created_at,
    created_by: p.created_by,
    updated_at: p.updated_at ?? undefined,
    members: p.members ?? [],
    tasks: [],
  }));

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.description || EMPTY_STRING).toLowerCase().includes(t),
    );
  }, [q, items]);

  const onCreateClick = () => {
    reset({
      title: EMPTY_STRING,
      description: EMPTY_STRING,
      tags: EMPTY_STRING,
    });
    setShowForm(true);
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      name: data.title,
      description: data.description || EMPTY_STRING,
    });
  };

  if (isLoading) return <div>{PAGE_LOADING}</div>;
  if (error instanceof Error)
    return <div>{`${ERR_MSG.PROJECTS_LOADING} ${error.message}`}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={PLACEHOLDERS.SEARCH_PROJECT}
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
                disabled={mutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-60"
              >
                {mutation.isPending ? OTHERS.CREATING : BUTTON_NAMES.CREATE}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
