import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { PROJECTS } from "../data/projects";
import { PROJECT_TYPE } from "../types/project";

export default function ProjectDetail({
  onSignOut,
}: {
  onSignOut?: () => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project: PROJECT_TYPE = PROJECTS.find((p) => p.id === id) || {
    id: "proj-0",
    title: "Project not found",
    description: "",
  };

  return (
    <div className="min-h-screen flex bg-bg text-fg">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <Header />

        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{project.title}</h2>
              <p className="text-muted mt-2">{project.description}</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                  JS
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                  PW
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-lg border border-border"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-orange-600 text-white"
                onClick={() => alert("Add Task")}
              >
                Add Task
              </button>
              {onSignOut && (
                <button
                  className="px-3 py-2 rounded-lg border border-border"
                  onClick={() => {
                    onSignOut();
                    navigate("/signin");
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="table bg-card border border-border rounded-lg p-3">
          <div className="row font-semibold">
            <div style={{ flex: 2 }}>Title</div>
            <div style={{ flex: 1 }}>Assignee</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 1 }}>Due Date</div>
          </div>

          <div className="row">
            <div style={{ flex: 2 }}>API integration for user profiles</div>
            <div style={{ flex: 1 }}>James Smith</div>
            <div style={{ flex: 1 }}>Done</div>
            <div style={{ flex: 1 }}>Jul 30, 2024</div>
          </div>

          <div className="row">
            <div style={{ flex: 2 }}>Implement search functionality</div>
            <div style={{ flex: 1 }}>Patricia Williams</div>
            <div style={{ flex: 1 }}>In Progress</div>
            <div style={{ flex: 1 }}>Aug 18, 2024</div>
          </div>
        </section>
      </main>
    </div>
  );
}
