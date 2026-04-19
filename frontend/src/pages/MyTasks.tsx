import React, { useEffect, useMemo, useState } from "react";
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
import toast from "react-hot-toast";
import TaskGrid from "../components/TaskGrid";
import { useAuth } from "../contexts/AuthContext";

export default function MyTasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(EMPTY_STRING);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getMyTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err?.message || ERR_MSG.TASKS_LOAD_FAIL);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
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

  // =========================
  // CALLBACK AFTER GRID ACTIONS
  // =========================
  const handleTaskChange = () => {
    // 🔥 ensures consistency with TaskGrid actions
    fetchTasks();
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div>
      {/* FILTERS */}
      <div className="flex justify-between items-center mb-3 gap-3">
        <TaskFilters
          query={query}
          setQuery={setQuery}
          status={statusFilter}
          setStatus={setStatusFilter}
          selectedTag={undefined} // ❌ removed dead tag logic
          setSelectedTag={() => {}}
          onClear={onClear}
        />
      </div>

      {loading && <p>{PAGE_LOADING}</p>}

      {error && (
        <p className="text-red-600" role="alert">
          {`${ERR_MSG.TASKS_LOADING} ${error}`}
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="p-6 text-center text-gray-600 border border-dashed border-gray-300 rounded">
          {OTHERS.FILTER_CHANGE}
        </div>
      )}

      {/* ================= TASK GRID ================= */}
      <section className="w-full">
        <TaskGrid
          filteredTasks={filtered}
          showAssignee={false}
          projectId={EMPTY_STRING} // required for consistency
          members={[]} // not needed here
        />
      </section>
    </div>
  );
}
