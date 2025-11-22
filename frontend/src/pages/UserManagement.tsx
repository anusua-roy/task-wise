// frontend/src/pages/UserManagement.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

/**
 * Minimal user type for frontend-only management.
 */
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  active: boolean;
};

const INITIAL_USERS: User[] = [
  {
    id: "u1",
    name: "Anusua Roy",
    email: "anusua@example.com",
    role: "admin",
    active: true,
  },
  {
    id: "u2",
    name: "Rohit Das",
    email: "rohit@example.com",
    role: "editor",
    active: true,
  },
  {
    id: "u3",
    name: "Leena Patel",
    email: "leena@example.com",
    role: "viewer",
    active: false,
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [editing, setEditing] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<User>();

  const onCreate = () => {
    reset({ id: "", name: "", email: "", role: "viewer", active: true });
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (u: User) => {
    reset(u);
    setEditing(u);
    setShowForm(true);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete user?")) return;
    setUsers((s) => s.filter((u) => u.id !== id));
  };

  const onSubmit = (data: Partial<User>) => {
    if (editing) {
      setUsers((s) =>
        s.map((u) =>
          u.id === editing.id ? ({ ...editing, ...data } as User) : u
        )
      );
    } else {
      const newUser: User = {
        id: `u_${Math.random().toString(36).slice(2, 8)}`,
        name: data.name || "New user",
        email: data.email || "",
        role: (data.role as User["role"]) || "viewer",
        active: data.active ?? true,
      };
      setUsers((s) => [newUser, ...s]);
    }
    setShowForm(false);
  };

  return (
    <section>
      <div className="flex items-center justify-end gap-4 mb-4">
        <button
          onClick={onCreate}
          className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
        >
          + New User
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
                {u.email} • {u.role}
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-[color:var(--card-bg)] rounded-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              {editing ? "Edit user" : "New user"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input
                  {...register("name")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm">Email</label>
                <input
                  {...register("email")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm">Role</label>
                <select
                  {...register("role")}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register("active")} />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md px-4 py-2 text-sm border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm bg-[color:var(--primary)] text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
