import React from "react";
import { TaskStatus } from "../types/task.type";
import {
  BUTTON_NAMES,
  PLACEHOLDERS,
  TASK_STATUS,
} from "../constants/App.constants";

interface Props {
  query: string;
  setQuery: (q: string) => void;
  status: string;
  setStatus: (s: string) => void;
  selectedTag?: string;
  setSelectedTag: (t?: string) => void;
  onClear?: () => void;
}

export default function TaskFilters({
  query,
  setQuery,
  status,
  setStatus,
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
        placeholder={PLACEHOLDERS.SEARCH_TASK}
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
        {Object.values(TASK_STATUS).map((s) => (
          <option key={s}>{s}</option>
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
        {BUTTON_NAMES.CLEAR}
      </button>
    </div>
  );
}
