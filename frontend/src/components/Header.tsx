import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_NAMES } from "../routes/constants";

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const raw =
    typeof window !== "undefined" ? localStorage.getItem("tw_user") : null;
  const user = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function handleSignOut() {
    localStorage.removeItem("tw_user");
    // navigate to signin
    navigate(ROUTE_NAMES.SIGNIN, { replace: true });
  }

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-muted text-sm">
          Here’s a summary of your projects and tasks.
        </p>
      </div>

      <div className="flex items-center gap-3 mt-3 md:mt-0">
        <button className="px-3 py-2 border border-border rounded-lg text-sm">
          Filter
        </button>
        <button className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm">
          New Project
        </button>

        {/* User dropdown */}
        <div
          className="relative"
          ref={ref}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <button
            onClick={() => setOpen((s) => !s)}
            className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm"
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-md shadow-sm z-50 transform translate-y-1"
              role="menu"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                role="menuitem"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
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
