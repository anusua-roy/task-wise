import React from "react";

export default function Sidebar(){
  return (
    <aside className="sidebar" aria-label="Main sidebar">
      <div className="logo">
        <div style={{width:28,height:28,borderRadius:6,background:'#fff4ed',display:'flex',alignItems:'center',justifyContent:'center',color:'#f97316'}}>✓</div>
        <div>TaskWise</div>
      </div>

      <nav style={{marginTop:20,display:'flex',flexDirection:'column',gap:12}}>
        <a href="/dashboard" style={{color:'inherit',textDecoration:'none'}}>Dashboard</a>
        <a href="/projects" style={{color:'inherit',textDecoration:'none'}}>Projects</a>
        <a href="/tasks" style={{color:'inherit',textDecoration:'none'}}>My Tasks</a>
        <a href="/users" style={{color:'inherit',textDecoration:'none'}}>User Management</a>
        <a href="/settings" style={{color:'inherit',textDecoration:'none'}}>Settings</a>
      </nav>
    </aside>
  );
}
