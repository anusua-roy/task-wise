// src/components/TaskCard.tsx
import React from 'react';
import { Task } from '../types/task';

interface Props {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
  return (
    <article
      className="task-card"
      aria-labelledby={`task-${task.id}-title`}
      role="article"
    >
      <header className="task-card__head">
        <h3 id={`task-${task.id}-title`} className="task-title">{task.title}</h3>
        <div className="task-meta">
          <span className={`badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
          {due && <time dateTime={task.dueDate} className="task-due">Due {due}</time>}
        </div>
      </header>

      {task.description && <p className="task-desc">{task.description}</p>}

      <footer className="task-card__foot">
        <div className="task-left">
          {task.tags?.slice(0, 3).map((t) => (
            <small key={t} className="tag">{t}</small>
          ))}
          {task.assignee && <small className="assignee">👤 {task.assignee.name}</small>}
        </div>

        <div className="task-actions">
          <select
            aria-label={`Change status for ${task.title}`}
            value={task.status}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as Task['status'])}
          >
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>

          <button type="button" onClick={() => onEdit?.(task)} aria-label={`Edit ${task.title}`}>
            Edit
          </button>
          <button type="button" onClick={() => onDelete?.(task.id)} aria-label={`Delete ${task.title}`}>
            Delete
          </button>
        </div>
      </footer>

      <style jsx>{`
        .task-card {
          border-radius: 8px;
          padding: 12px;
          background: var(--card-bg, white);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .task-title { margin:0; font-size: 1rem; }
        .task-meta { display:flex; gap:8px; align-items:center; }
        .badge { font-size: .75rem; padding: 4px 6px; border-radius: 6px; text-transform: capitalize; }
        .status-todo { background: #f0f3ff; color:#2a3eb1; }
        .status-in-progress { background:#fff8e6; color:#b28900; }
        .status-blocked { background:#ffecec; color:#b12a2a; }
        .status-done { background:#e6ffef; color:#0a7a3b; }
        .task-desc { margin:0; color: var(--muted, #555); font-size: .95rem; }
        .task-card__foot { display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .tag { background: rgba(0,0,0,0.04); padding:4px 6px; border-radius:6px; margin-right:6px; font-size:.8rem;}
        .assignee { margin-left:6px; font-size:.85rem; color:var(--muted,#666) }
        .task-actions select { margin-right:8px; }
        @media (max-width:520px) {
          .task-card__foot { flex-direction: column; align-items:flex-start; gap:8px; }
          .task-actions { display:flex; gap:8px; }
        }
      `}</style>
    </article>
  `);
}