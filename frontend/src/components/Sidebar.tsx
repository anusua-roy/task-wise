import React from "react";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 p-4 border-r border-border bg-bg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
          ✓
        </div>
        <span className="font-semibold">TaskWise</span>
      </div>

      <nav className="flex flex-col gap-3 text-sm">
        <a href="/dashboard" className="hover:text-orange-600">
          Dashboard
        </a>
        <a href="/projects" className="hover:text-orange-600">
          Projects
        </a>
        <a href="/tasks" className="hover:text-orange-600">
          My Tasks
        </a>
        <a href="/users" className="hover:text-orange-600">
          User Management
        </a>
        <a href="/settings" className="hover:text-orange-600">
          Settings
        </a>
      </nav>
    </aside>
  );
}
