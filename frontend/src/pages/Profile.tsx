// frontend/src/pages/Profile.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";

type FormValues = {
  name?: string;
  email?: string;
};

export default function Profile() {
  const { user, signIn } = useAuth(); // assume context exposes setter; if not, we'll keep local only
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: user?.name, email: user?.email },
  });
  const [editing, setEditing] = useState(false);

  const onSubmit = (data: FormValues) => {
    // local update only — backend wiring later
    if (signIn) {
      signIn({
        ...user,
        name: (data.name || user?.name) as string,
        email: data.email || user?.email,
      });
    }
    setEditing(false);
  };

  return (
    <section>
      <div className="mb-4">
        <div className="text-sm text-[color:var(--muted)]">Account</div>
        <h2 className="text-lg font-semibold">Profile</h2>
      </div>

      <div className="p-4 border rounded-md bg-[color:var(--card-bg)] max-w-xl">
        {!editing ? (
          <>
            <div className="mb-3">
              <div className="text-sm text-[color:var(--muted)]">Name</div>
              <div className="font-medium">{user?.name ?? "—"}</div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-[color:var(--muted)]">Email</div>
              <div className="font-medium">{user?.email ?? "—"}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-md px-4 py-2 text-sm border"
              >
                Edit
              </button>
            </div>
          </>
        ) : (
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

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
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
        )}
      </div>
    </section>
  );
}
