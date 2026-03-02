// src/components/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_META, ROUTE_NAMES } from "../routes/constants";
import { PROJECT_DESCRIPTION, PROJECT_NAME } from "../constants/App.constants";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const { pathname } = location;

  // Find route-specific metadata
  const match = ROUTE_META.find((r) => r.test(pathname));

  // Fallbacks (REQUIRED CHANGE YOU ASKED FOR)
  const title = match ? match.title : PROJECT_NAME;
  const description = match ? match.description : PROJECT_DESCRIPTION;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Update browser tab title
  useEffect(() => {
    try {
      document.title = `${title} — ${PROJECT_NAME}`;
    } catch {}
  }, [title]);

  return (
    <header className="border-b bg-[color:var(--bg)] border-[color:var(--muted-border)] mb-4">
      <div className="w-full mx-auto px-2 sm:px-2 lg:px-2 pb-1 flex items-start justify-between gap-4">
        {/* Dynamic Title + Description */}
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-[color:var(--muted)]">{description}</p>
        </div>

        {/* Avatar + Menu */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => navigate(ROUTE_NAMES.PROFILE)}
            aria-haspopup="true"
            aria-expanded={open}
            className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm"
            type="button"
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </button>
        </div>
      </div>
    </header>
  );
}
