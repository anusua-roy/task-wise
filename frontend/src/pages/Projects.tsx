import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import { PROJECTS } from "../data/projects";
import { IProject } from "../types/project.type";
import { ROUTE_NAMES } from "../routes/constants";

export default function Projects() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [items] = useState<IProject[]>(PROJECTS);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.description || "").toLowerCase().includes(t)
    );
  }, [q, items]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects"
          className="w-full sm:w-64 p-2.5 rounded-lg border border-border bg-white text-sm"
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </section>
    </div>
  );
}
