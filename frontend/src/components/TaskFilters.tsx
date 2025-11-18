import React from "react";
import { TaskStatus } from "../types/task.type";

interface Props {
  query: string;
  setQuery: (q: string) => void;
  status: TaskStatus | "all";
  setStatus: (s: TaskStatus | "all") => void;
  tagOptions: string[];
  selectedTag?: string;
  setSelectedTag: (t?: string) => void;
  onClear?: () => void;
}

export default function TaskFilters({
  query,
  setQuery,
  status,
  setStatus,
  tagOptions,
  selectedTag,
  setSelectedTag,
  onClear,
}: Props) {
  return (
    <div
      className="
        flex flex-wrap items-center gap-2 mb-3
        max-[520px]:gap-1.5
      "
      role="search"
      aria-label="Filter tasks"
    >
      {/* Search */}
      <input
        type="search"
        placeholder="Search tasks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search tasks by title or description"
        className="
          min-w-[160px] px-2 py-2 border border-black/10 rounded-md
          max-[520px]:flex-[1_1_100%]
        "
      />

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
        aria-label="Filter by status"
        className="px-2 py-2 border border-black/10 rounded-md"
      >
        <option value="all">All</option>
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="blocked">Blocked</option>
        <option value="done">Done</option>
      </select>

      {/* Tag Filter */}
      <select
        value={selectedTag || ""}
        onChange={(e) => setSelectedTag(e.target.value || undefined)}
        aria-label="Filter by tag"
        className="px-2 py-2 border border-black/10 rounded-md"
      >
        <option value="">All tags</option>
        {tagOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Clear Button */}
      <button
        type="button"
        onClick={onClear}
        className="
          px-3 py-2 border border-black/10 rounded-md
          hover:bg-gray-100 transition
        "
      >
        Clear
      </button>
    </div>
  );
}
