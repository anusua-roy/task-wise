// src/pages/MyTasks.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Task } from "../types/task.type";
import * as tasksApi from "../api/tasks.service";
import TaskFilters from "../components/TaskFilters";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  FORM_LABEL,
  OTHERS,
  PAGE_LOADING,
  TASK_STATUS,
  TASK_TABLE,
} from "../constants/App.constants";
import toast from "react-hot-toast";
import TaskGrid from "../components/TaskGrid";

type FormValues = {
  title: string;
  description?: string;
  status?: Task["status"];
  tags?: string;
  dueDate?: string;
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(EMPTY_STRING);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await tasksApi.getMyTasks();
        setTasks(data);
      } catch (err: any) {
        setError(err?.message || ERR_MSG.TASKS_LOAD_FAIL);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => s.add(tag)));
    return Array.from(s);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== TASK_STATUS.ALL && t.status !== statusFilter)
        return false;
      if (tagFilter && !(t.tags || []).includes(tagFilter)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (t.title + " " + (t.description || EMPTY_STRING))
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [tasks, statusFilter, tagFilter, query]);

  const onClear = () => {
    setQuery(EMPTY_STRING);
    setStatusFilter(TASK_STATUS.ALL);
    setTagFilter(undefined);
  };

  const onCreateClick = () => {
    reset({
      title: EMPTY_STRING,
      description: EMPTY_STRING,
      status: TASK_STATUS.NEW as Task["status"],
      tags: EMPTY_STRING,
      dueDate: EMPTY_STRING,
    });
    setEditing(null);
    setShowForm(true);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editing) {
        // const updated = await tasksApi.updateTask(editing.id, {
        //   title: data.title,
        //   description: data.description,
        //   status: data.status,
        //   tags: data.tags
        //     ? data.tags
        //         .split(",")
        //         .map((x) => x.trim())
        //         .filter(Boolean)
        //     : [],
        //   dueDate: data.dueDate || null,
        // });
        // setTasks((s) => s.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        // const created = await tasksApi.createTask({
        //   title: data.title,
        //   description: data.description,
        //   status: data.status,
        //   tags: data.tags
        //     ? data.tags
        //         .split(",")
        //         .map((x) => x.trim())
        //         .filter(Boolean)
        //     : [],
        //   dueDate: data.dueDate || null,
        // });
        // setTasks((s) => [created, ...s]);
      }
      setShowForm(false);
    } catch {
      toast.error(ERR_MSG.SAVE_FAIL);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3 gap-3">
        <TaskFilters
          query={query}
          setQuery={setQuery}
          status={statusFilter}
          setStatus={setStatusFilter}
          tagOptions={tagOptions}
          selectedTag={tagFilter}
          setSelectedTag={setTagFilter}
          onClear={onClear}
        />
        <button
          onClick={onCreateClick}
          className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
        >
          {BUTTON_NAMES.ADD_TASK}
        </button>
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

      {/* Task Grid */}
      <section className="w-full">
        <TaskGrid tasks={filtered} />
      </section>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow-xl w-full max-w-lg flex flex-col gap-3"
            role="dialog"
            aria-modal="true"
            aria-label={
              editing ? BUTTON_NAMES.EDIT_TASK : BUTTON_NAMES.CREATE_TASK
            }
          >
            <h2 className="text-xl font-semibold">
              {editing ? BUTTON_NAMES.EDIT_TASK : BUTTON_NAMES.NEW_TASK}
            </h2>

            <label className="flex flex-col gap-1 text-sm">
              {FORM_LABEL.TITLE}
              <input
                {...register("title", { required: true })}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              {FORM_LABEL.DESCRIPTION}
              <textarea
                {...register("description")}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              {FORM_LABEL.STATUS}
              <select
                {...register("status")}
                className="border border-gray-300 rounded px-2 py-2"
              >
                <option value={TASK_STATUS.NEW}>{TASK_STATUS.NEW}</option>
                <option value={TASK_STATUS.IN_PROGRESS}>
                  {TASK_STATUS.IN_PROGRESS}
                </option>
                <option value={TASK_STATUS.BLOCKED}>
                  {TASK_STATUS.BLOCKED}
                </option>
                <option value={TASK_STATUS.DONE}>{TASK_STATUS.DONE}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              {FORM_LABEL.TAGS}
              <input
                {...register("tags")}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              {FORM_LABEL.DUE_DATE}
              <input
                type="date"
                {...register("dueDate")}
                className="border border-gray-300 rounded px-2 py-2"
              />
            </label>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                {BUTTON_NAMES.SAVE}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {BUTTON_NAMES.CANCEL}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
