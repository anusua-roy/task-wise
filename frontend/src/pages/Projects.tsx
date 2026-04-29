import React, { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { IProject } from "../types/project.type";
import { useForm } from "react-hook-form";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  OTHERS,
  PAGE_LOADING,
  PLACEHOLDERS,
} from "../constants/App.constants";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getProjects, createProject } from "../api/projects.service";
import { getUsersLookup } from "../api/users.service";
import { PROJECTS_QUERY } from "../constants/Query.constants";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { canCreateTask } from "../utils/common";

type FormValues = {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
};

export default function Projects() {
  const { user } = useAuth();

  // 🔍 project search
  const [q, setQ] = useState(EMPTY_STRING);

  // 🔍 user search (FIXED)
  const [userSearch, setUserSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // =========================
  // USERS
  // =========================
  const { data: users = [] } = useQuery({
    queryKey: ["users_lookup"],
    queryFn: getUsersLookup,
  });

  // =========================
  // PROJECTS
  // =========================
  const { data, isLoading, error } = useQuery({
    queryKey: [PROJECTS_QUERY],
    queryFn: getProjects,
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY] });

      setShowForm(false);
      reset();

      // RESET EVERYTHING CLEANLY
      setSelectedMembers([]);
      setUserSearch("");

      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create project");
    },
  });

  const { register, handleSubmit, reset } = useForm<FormValues>();

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
      start_date: EMPTY_STRING,
      end_date: EMPTY_STRING,
    });

    setSelectedMembers([]);
    setUserSearch("");
    setShowForm(true);
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      name: data.title,
      description: data.description || EMPTY_STRING,
      member_ids: selectedMembers,
      start_date: data.start_date,
      end_date: data.end_date,
    });
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  if (isLoading) return <div>{PAGE_LOADING}</div>;

  if (error instanceof Error)
    return <div>{`${ERR_MSG.PROJECTS_LOADING} ${error.message}`}</div>;

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={PLACEHOLDERS.SEARCH_PROJECT}
          className="w-full sm:w-64 p-2.5 rounded-lg border text-sm"
        />

        {canCreateTask(user) && (
          <button
            onClick={onCreateClick}
            className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
          >
            {BUTTON_NAMES.ADD_PROJECT}
          </button>
        )}
      </div>

      {/* ================= PROJECT GRID ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </section>

      {/* ================= MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow-xl w-full max-w-lg flex flex-col gap-3"
          >
            <h2 className="text-xl font-semibold">
              {BUTTON_NAMES.CREATE_PROJECT}
            </h2>
            <input
              {...register("title", { required: true })}
              placeholder="Project Title"
              className="border p-2"
            />
            <textarea
              {...register("description")}
              placeholder="Description"
              className="border p-2"
            />
            From:
            <input
              type="date"
              {...register("start_date", {
                required: "Start date is required",
              })}
              className="border p-2"
            />
            To:
            <input
              type="date"
              {...register("end_date", {
                required: "End date is required",
                validate: (value, formValues) =>
                  value >= formValues.start_date ||
                  "End date must be after start date",
              })}
              className="border p-2"
            />
            {/* ================= MEMBERS ================= */}
            <div>
              <p className="text-sm font-medium mb-1">Add Members</p>

              {/* SEARCH */}
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full border px-2 py-1 mb-2 text-sm rounded"
              />

              {/* SELECTED */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedMembers.map((id) => {
                    const user = (users as any[]).find((u) => u.id === id);

                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                      >
                        {user?.name}
                        <button
                          type="button"
                          onClick={() => toggleMember(id)}
                          className="text-orange-700 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* LIST */}
              <div className="max-h-40 overflow-y-auto border rounded">
                {(users as any[])
                  .filter((u) =>
                    u.name.toLowerCase().includes(userSearch.toLowerCase()),
                  )
                  .map((u: any) => {
                    const selected = selectedMembers.includes(u.id);

                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleMember(u.id)}
                        className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center
                        ${
                          selected
                            ? "bg-orange-50 text-orange-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span>{u.name}</span>
                        {selected && <span>✓</span>}
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* ================= ACTIONS ================= */}
            <div className="flex justify-end gap-2">
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
