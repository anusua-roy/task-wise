// src/components/TaskFilters.tsx
import React from 'react';
import { TaskStatus } from '../types/task';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  status: TaskStatus | 'all';
  setStatus: (s: TaskStatus | 'all') => void;
  tagOptions: string[];
  selectedTag?: string;
  setSelectedTag: (t?: string) => void;
  onClear?: () => void;
}

export default function TaskFilters({
  query, setQuery, status, setStatus, tagOptions, selectedTag, setSelectedTag, onClear,
}: Props) {
  return (
    <div className="task-filters" role="search" aria-label="Filter tasks">
      <input
        type="search"
        placeholder="Search tasks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search tasks by title or description"
      />
      <select value={status} onChange={(e) => setStatus(e.target.value as any)} aria-label="Filter by status">
        <option value="all">All</option>
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="blocked">Blocked</option>
        <option value="done">Done</option>
      </select>
      <select
        value={selectedTag || ''}
        onChange={(e) => setSelectedTag(e.target.value || undefined)}
        aria-label="Filter by tag"
      >
        <option value="">All tags</option>
        {tagOptions.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button type="button" onClick={onClear}>Clear</button>

      <style jsx>{`
        .task-filters { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
        input[type="search"] { min-width: 160px; padding:8px; border-radius:6px; border:1px solid rgba(0,0,0,0.08);}
        select { padding:8px; border-radius:6px; border:1px solid rgba(0,0,0,0.08); }
        button { padding:8px 10px; border-radius:6px; background:transparent; border:1px solid rgba(0,0,0,0.06); }
        @media (max-width:520px) {
          .task-filters { gap:6px; }
          input[type="search"] { flex:1 1 100%; }
        }
      `}</style>
    </div>
  );
}