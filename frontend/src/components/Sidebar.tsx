import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTE_NAMES } from "../routes/constants";

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
        <Link
          to={ROUTE_NAMES.DASHBOARD}
          className={linkClass(ROUTE_NAMES.DASHBOARD)}
        >
          Dashboard
        </Link>
        <Link
          to={ROUTE_NAMES.PROJECTS}
          className={linkClass(ROUTE_NAMES.PROJECTS)}
        >
          Projects
        </Link>
        <Link to={ROUTE_NAMES.TASKS} className={linkClass(ROUTE_NAMES.TASKS)}>
          My Tasks
        </Link>
        <Link to={ROUTE_NAMES.USERS} className={linkClass(ROUTE_NAMES.USERS)}>
          User Management
        </Link>
        <Link
          to={ROUTE_NAMES.SETTINGS}
          className={linkClass(ROUTE_NAMES.SETTINGS)}
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
