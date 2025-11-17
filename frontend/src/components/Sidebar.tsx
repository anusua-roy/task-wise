import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTE_NAMES } from "../routes/constants";

const SIDEBAR_OPTIONS = {
  DASHBOARD: "Dashboard",
  PROJECTS: "Projects",
  TASKS: "My Tasks",
  USERS: "User Management",
  SETTINGS: "Settings",
};

export default function Sidebar() {
  const { pathname } = useLocation();
  const linkClass = (path: string) =>
    `text-sm px-2 py-1 rounded-md hover:text-orange-600 ${
      pathname === path ? "text-orange-600 font-medium" : "text-fg"
    }`;
  return (
    <aside className="hidden md:flex flex-col w-56 p-4 border-r border-border bg-bg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
          ✓
        </div>
        <span className="font-semibold">TaskWise</span>
      </div>

      <nav className="flex flex-col gap-2">
        {Object.entries(SIDEBAR_OPTIONS).map(([key, value], index) => (
          <Link to={ROUTE_NAMES[key]} className={linkClass(ROUTE_NAMES[key])}>
            {value}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
