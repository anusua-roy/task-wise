import React from "react";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("tw_user") || "{}");

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-muted text-sm">Here’s a summary of your projects and tasks.</p>
      </div>

      <div className="flex items-center gap-3 mt-3 md:mt-0">
        <button className="px-3 py-2 border border-border rounded-lg text-sm">Filter</button>
        <button className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm">New Project</button>
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm">
          {user?.name?.[0] || 'U'}
        </div>
      </div>
    </header>
  );
}
