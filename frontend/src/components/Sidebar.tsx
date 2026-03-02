import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTasks } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_NAMES } from "../routes/constants";
import { PROJECT_NAME, SIDEBAR_OPTIONS } from "../constants/App.constants";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const options = Object.entries(SIDEBAR_OPTIONS).filter(([key, value]) => {
    if (user?.role.name === "Admin") return true;
    else return value !== SIDEBAR_OPTIONS.USERS;
  });
  const linkClass = (path: string) =>
    `text-sm px-2 py-1 rounded-md hover:text-orange-600 ${
      pathname === path ? "text-orange-600 font-medium" : "text-fg"
    }`;
  return (
    <aside className="hidden md:flex flex-col w-56 p-4 border-r border-border bg-bg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
          <FaTasks />
        </div>
        <span className="font-semibold">{PROJECT_NAME}</span>
      </div>

      <nav className="flex flex-col gap-2">
        {options.map(([key, value], index) => (
          <Link to={ROUTE_NAMES[key]} className={linkClass(ROUTE_NAMES[key])}>
            {value}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
