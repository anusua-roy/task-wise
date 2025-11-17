import React from "react";

export default function Header() {
  const raw =
    typeof window !== "undefined" ? localStorage.getItem("tw_user") : null;
  const user = raw ? JSON.parse(raw) : null;
  return (
    <header className="header" role="banner">
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Dashboard</h1>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Here's a summary of your projects and tasks.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
          }}
        >
          Filter
        </button>
        <button
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
          }}
        >
          New Project
        </button>
        <div
          style={{
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          {user?.name ?? "You"}
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          N
        </div>
      </div>
    </header>
  );
}

