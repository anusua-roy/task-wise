import React, { useMemo, useState } from "react";
import { Task } from "../types/task.type";
import * as tasksApi from "../api/tasks.service";
import TaskFilters from "../components/TaskFilters";
import {
  EMPTY_STRING,
  ERR_MSG,
  OTHERS,
  PAGE_LOADING,
  TASK_STATUS,
} from "../constants/App.constants";
import TaskGrid from "../components/TaskGrid";
import { useQuery } from "@tanstack/react-query";

export default function MyTasksPage() {
  const [query, setQuery] = useState(EMPTY_STRING);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // React Query (NO stale state issue ever)
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: tasksApi.getMyTasks,
  });

  // =========================
  // FILTER
  // =========================
  const filtered = useMemo(() => {
    return tasks.filter((t: Task) => {
      if (statusFilter !== TASK_STATUS.ALL && t.status !== statusFilter)
        return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        return (t.title + " " + (t.description || EMPTY_STRING))
          .toLowerCase()
          .includes(q);
      }

      return true;
    });
  }, [tasks, statusFilter, query]);

  const onClear = () => {
    setQuery(EMPTY_STRING);
    setStatusFilter(TASK_STATUS.ALL);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3 gap-3">
        <TaskFilters
          query={query}
          setQuery={setQuery}
          status={statusFilter}
          setStatus={setStatusFilter}
          selectedTag={undefined}
          setSelectedTag={() => {}}
          onClear={onClear}
        />
      </div>

      {isLoading && <p>{PAGE_LOADING}</p>}

      {error && (
        <p className="text-red-600" role="alert">
          {`${ERR_MSG.TASKS_LOADING} ${(error as Error).message}`}
        </p>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="p-6 text-center text-gray-600 border border-dashed border-gray-300 rounded">
          {OTHERS.FILTER_CHANGE}
        </div>
      )}

      <section className="w-full">
        <TaskGrid
          filteredTasks={filtered}
          showAssignee={false}
          projectId={EMPTY_STRING}
          members={[]}
          onTaskUpdated={refetch} // KEY FIX
        />
      </section>
    </div>
  );
}
