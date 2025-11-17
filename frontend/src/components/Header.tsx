import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const raw = typeof window !== "undefined" ? localStorage.getItem("tw_user") : null;
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
    navigate("/signin", { replace: true });
  }

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-muted text-sm">Here’s a summary of your projects and tasks.</p>
      </div>

      <div className="flex items-center gap-3 mt-3 md:mt-0">
        <button className="px-3 py-2 border border-border rounded-lg text-sm">Filter</button>
        <button className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm">New Project</button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm"
            aria-haspopup="true"
            aria-expanded={open}
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-sm z-40">
              <button
                onClick={() => { setOpen(false); navigate("/profile"); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                onClick={() => { setOpen(false); handleSignOut(); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
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
