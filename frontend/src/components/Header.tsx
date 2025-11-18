// src/components/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_NAMES } from "../routes/constants";

/**
 * Route metadata table:
 * - Expand this list as needed.
 * - First matching entry is used.
 */
const ROUTE_META = [
  {
    test: (p: string) => p === "/" || p === "/projects",
    title: "Projects",
    description: "Browse and manage your projects.",
  },
  {
    test: (p: string) => p.startsWith("/projects/"),
    title: "Project Details",
    description: "Detailed view of the selected project and its tasks.",
  },
  {
    test: (p: string) => p.startsWith("/my-tasks"),
    title: "My Tasks",
    description: "Tasks assigned to you and your current progress.",
  },
  {
    test: (p: string) => p.startsWith("/settings"),
    title: "Settings",
    description: "Manage your account and application settings.",
  },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const { pathname } = location;

  // Find route-specific metadata
  const match = ROUTE_META.find((r) => r.test(pathname));

  // Fallbacks (REQUIRED CHANGE YOU ASKED FOR)
  const title = match ? match.title : "TaskWise";
  const description = match
    ? match.description
    : "A clean workspace for your projects and tasks.";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function handleSignOut() {
    signOut();
    navigate(ROUTE_NAMES.SIGNIN, { replace: true });
  }

  // Update browser tab title
  useEffect(() => {
    try {
      document.title = `${title} — TaskWise`;
    } catch {}
  }, [title]);

  return (
    <header className="border-b bg-[color:var(--bg)] border-[color:var(--muted-border)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start justify-between gap-4">

        {/* Dynamic Title + Description */}
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">{description}</p>
        </div>

        {/* Avatar + Menu */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={open}
            className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm"
            type="button"
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-40 rounded-md border bg-[color:var(--card-bg)] shadow-lg z-50"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate(ROUTE_NAMES.DASHBOARD);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                role="menuitem"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-slate-50"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}