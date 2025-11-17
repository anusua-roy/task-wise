import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import { PROJECTS } from "../data/projects";

export default function Dashboard() {
  return (
    <div>
      <div className="cards-row" role="list">
        {PROJECTS.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>

      <section>
        <h2 style={{ marginTop: 8 }}>My Tasks</h2>
        <div className="table" style={{ marginTop: 12 }}>
          <div className="row" style={{ fontWeight: 600 }}>
            <div style={{ flex: 2 }}>Task</div>
            <div style={{ flex: 1 }}>Assignee</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 1 }}>Due Date</div>
          </div>
          <div className="row">
            <div style={{ flex: 2 }}>Design login page</div>
            <div style={{ flex: 1 }}>—</div>
            <div style={{ flex: 1 }}>Done</div>
            <div style={{ flex: 1 }}>Aug 10, 2024</div>
          </div>
          <div className="row">
            <div style={{ flex: 2 }}>API integration for user profiles</div>
            <div style={{ flex: 1 }}>James Smith</div>
            <div style={{ flex: 1 }}>Done</div>
            <div style={{ flex: 1 }}>Jul 30, 2024</div>
          </div>
        </div>
      </section>
    </div>
  );
}
