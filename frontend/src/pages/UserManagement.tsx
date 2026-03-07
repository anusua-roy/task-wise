// frontend/src/pages/UserManagement.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  PAGE_LOADING,
} from "../constants/App.constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/users.service";
import { getRoles } from "../api/roles.service";
import { USERS_QUERY, ROLES_QUERY } from "../constants/Query.constants";
import { User, UserFormType } from "../types/user.type";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [editing, setEditing] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<UserFormType>();
  const { data, isLoading, error } = useQuery({
    queryKey: [USERS_QUERY],
    queryFn: getUsers,
  });
  const { data: roles = [] } = useQuery({
    queryKey: [ROLES_QUERY],
    queryFn: getRoles,
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY] });
      toast.success("User created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY] });
      toast.success("User updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY] });
      toast.success("User deleted");
    },
  });

  const users = data ?? [];

  const onCreate = () => {
    reset({
      id: EMPTY_STRING,
      name: EMPTY_STRING,
      email: EMPTY_STRING,
      role: "User",
    });
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (u: User) => {
    const role = roles.find((r) => r.name === u.role.name);

    reset({
      id: u.id,
      name: u.name,
      email: u.email,
      role: role?.id,
    });

    setEditing(u);
    setShowForm(true);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete user?")) return;
    deleteMutation.mutate(id);
  };

  const onSubmit = (data: Partial<UserFormType>) => {
    const payload = {
      name: data.name,
      email: data.email,
      role_id: data.role,
    };

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
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
          {BUTTON_NAMES.NEW_USER}
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
                {BUTTON_NAMES.EDIT}
              </button>
              <button
                onClick={() => onDelete(u.id)}
                className="text-sm rounded-md px-2 py-1 border text-red-600"
                aria-label={`Delete ${u.name}`}
              >
                {BUTTON_NAMES.DELETE}
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
              <select {...register("role")}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
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
