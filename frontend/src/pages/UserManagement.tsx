// frontend/src/pages/UserManagement.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  BUTTON_NAMES,
  ERR_MSG,
  PAGE_LOADING,
} from "../constants/App.constants";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/users.service";
import { USERS_QUERY } from "../constants/Query.constants";
import { User, UserFormType } from "../types/user.type";

export default function UserManagement() {
  const [editing, setEditing] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<UserFormType>();
  const { data, isLoading, error } = useQuery({
    queryKey: [USERS_QUERY],
    queryFn: getUsers,
  });

  const users = data ?? [];

  const onCreate = () => {
    reset({ id: "", name: "", email: "", role: "User" });
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (u: User) => {
    reset({ ...u, role: u.role.name });
    setEditing(u);
    setShowForm(true);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete user?")) return;
    // setUsers((s) => s.filter((u) => u.id !== id));
  };

  const onSubmit = (data: Partial<UserFormType>) => {
    if (editing) {
      // setUsers((s) =>
      //   s.map((u) =>
      //     u.id === editing.id ? ({ ...editing, ...data } as User) : u
      //   )
      // );
    } else {
      const newUser: User = {
        id: `u_${Math.random().toString(36).slice(2, 8)}`,
        name: data.name || "New user",
        email: data.email || "",
        role: (data.role as unknown as User["role"]) || "user",
      };
      // setUsers((s) => [newUser, ...s]);
    }
    setShowForm(false);
  };

  if (isLoading) return <div>{PAGE_LOADING}</div>;
  if (error instanceof Error)
    return <div>{`${ERR_MSG.USERS_LOADING} ${error.message}`}</div>;

  return (
    <section>
      <div className="flex items-center justify-end gap-4 mb-4">
        <button
          onClick={onCreate}
          className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
        >
          New User
        </button>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-4 p-3 border rounded-md bg-[color:var(--card-bg)]"
          >
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-[color:var(--muted)]">
                {u.email} • {u.role.name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(u)}
                className="text-sm rounded-md px-2 py-1 border"
                aria-label={`Edit ${u.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(u.id)}
                className="text-sm rounded-md px-2 py-1 border text-red-600"
                aria-label={`Delete ${u.name}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow-xl w-full max-w-lg flex flex-col gap-3"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit user" : "New user"}
          >
            <h2 className="text-xl font-semibold">
              {editing ? "Edit user" : "New user"}
            </h2>

            <label className="flex flex-col gap-1 text-sm">Name</label>
            <input
              {...register("name")}
              className="border border-gray-300 rounded px-2 py-2"
            />

            <label className="flex flex-col gap-1 text-sm">Email</label>
            <input
              {...register("email")}
              className="border border-gray-300 rounded px-2 py-2"
            />

            <div>
              <label className="flex flex-col gap-1 text-sm">Role</label>
              <select
                {...register("role")}
                className="border border-gray-300 rounded px-2 py-2"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                {BUTTON_NAMES.SAVE}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {BUTTON_NAMES.CANCEL}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
