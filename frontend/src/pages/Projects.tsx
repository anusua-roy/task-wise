import React, { useMemo, useState } from "react";
import {useNavigate} from "react-router-dom"
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import { PROJECTS } from "../data/projects";
import { PROJECT_TYPE } from "../types/project";

export default function Projects() {
  const [q, setQ] = useState("");
  const navigate = useNavigate()
  const [items] = useState<PROJECT_TYPE[]>(PROJECTS);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.description || "").toLowerCase().includes(t)
    );
  }, [q, items]);

  function openProject(id: string) {
    navigate(`/projects/${id}`)
  }

  return (
    <div className="min-h-screen flex bg-bg text-fg">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <Header />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects"
            className="w-full sm:w-64 p-2.5 rounded-lg border border-border bg-white text-sm"
          />

          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm">
              New Project
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={openProject} />
          ))}
        </section>
      </main>
    </div>
  );
}
