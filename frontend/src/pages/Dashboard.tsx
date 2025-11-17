import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";

const mock = [
  {id: 'p1', title: 'TaskWise App Development', subtitle: 'The main development project for the TaskWise application.', progress: 33},
  {id: 'p2', title: 'Backend API Service', subtitle: 'Developing the backend services and APIs.', progress: 50},
  {id: 'p3', title: 'Marketing Campaign Q3', subtitle: 'Planning and execution of the marketing campaign', progress: 0},
  {id: 'p4', title: 'Website Redesign', subtitle: 'A complete overhaul of the public-facing corporate website.', progress: 0},
];

export default function Dashboard(){
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Header />
        <div className="cards-row" role="list">
          {mock.map(m => <ProjectCard key={m.id} title={m.title} subtitle={m.subtitle} progress={m.progress} />)}
        </div>

        <section>
          <h2 style={{marginTop:8}}>My Tasks</h2>
          <div className="table" style={{marginTop:12}}>
            <div className="row" style={{fontWeight:600}}>
              <div style={{flex:2}}>Task</div>
              <div style={{flex:1}}>Assignee</div>
              <div style={{flex:1}}>Status</div>
              <div style={{flex:1}}>Due Date</div>
            </div>
            <div className="row">
              <div style={{flex:2}}>Design login page</div>
              <div style={{flex:1}}>—</div>
              <div style={{flex:1}}>Done</div>
              <div style={{flex:1}}>Aug 10, 2024</div>
            </div>
            <div className="row">
              <div style={{flex:2}}>API integration for user profiles</div>
              <div style={{flex:1}}>James Smith</div>
              <div style={{flex:1}}>Done</div>
              <div style={{flex:1}}>Jul 30, 2024</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
