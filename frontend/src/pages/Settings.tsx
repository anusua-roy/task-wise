// frontend/src/pages/Settings.tsx
import React, { useState } from "react";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [compactLayout, setCompactLayout] = useState(false);

  return (
    <section>
      <div className="space-y-6">
        <div className="p-4 border rounded-md bg-[color:var(--card-bg)]">
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            Control how you receive notifications.
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-sm">Email notifications</div>
              <div className="text-xs text-[color:var(--muted)]">
                Receive updates by email
              </div>
            </div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div className="p-4 border rounded-md bg-[color:var(--card-bg)]">
          <h3 className="font-medium">Display</h3>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            Adjust layout preferences.
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-sm">Compact layout</div>
              <div className="text-xs text-[color:var(--muted)]">
                Reduce spacing for dense lists
              </div>
            </div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={compactLayout}
                onChange={(e) => setCompactLayout(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div className="p-4 border rounded-md bg-[color:var(--card-bg)] flex justify-end">
          <button className="rounded-md px-4 py-2 text-sm border mr-2">
            Cancel
          </button>
          <button className="rounded-md px-4 py-2 text-sm bg-[color:var(--primary)] text-white">
            Save
          </button>
        </div>
      </div>
    </section>
  );
}
