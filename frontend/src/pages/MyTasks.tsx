// src/pages/MyTasks.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you use react-router
import { Task } from '../types/task';
import * as tasksApi from '../api/tasks';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import { useForm } from 'react-hook-form';

type FormValues = {
  title: string;
  description?: string;
  status?: Task['status'];
  tags?: string;
  dueDate?: string;
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
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
        setError(err?.message || 'Failed to load tasks');
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
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (tagFilter && !(t.tags || []).includes(tagFilter)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (t.title + ' ' + (t.description || '')).toLowerCase().includes(q);
      }
      return true;
    });
  }, [tasks, statusFilter, tagFilter, query]);

  const onClear = () => {
    setQuery('');
    setStatusFilter('all');
    setTagFilter(undefined);
  };

  const onCreateClick = () => {
    reset({ title: '', description: '', status: 'todo', tags: '', dueDate: '' });
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (task: Task) => {
    setEditing(task);
    reset({
      title: task.title,
      description: task.description || '',
      status: task.status,
      tags: (task.tags || []).join(', '),
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.deleteTask(id);
      setTasks((s) => s.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const onStatusChange = async (id: string, status: Task['status']) => {
    try {
      const updated = await tasksApi.updateTask(id, { status });
      setTasks((s) => s.map((t) => (t.id === id ? updated : t)));
    } catch {
      alert('Failed to update status');
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editing) {
        const updated = await tasksApi.updateTask(editing.id, {
          title: data.title,
          description: data.description,
          status: data.status,
          tags: data.tags ? data.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
          dueDate: data.dueDate || null,
        });
        setTasks((s) => s.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await tasksApi.createTask({
          title: data.title,
          description: data.description,
          status: data.status,
          tags: data.tags ? data.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
          dueDate: data.dueDate || null,
        });
        setTasks((s) => [created, ...s]);
      }
      setShowForm(false);
    } catch (err) {
      alert('Failed to save');
    }
  };

  return (
    <main>
      <div className="page-head">
        <h1>My Tasks</h1>
        <div>
          <button onClick={onCreateClick}>+ New Task</button>
        </div>
      </div>

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

      {loading && <p>Loading tasks…</p>}
      {error && <p role="alert">Error: {error}</p>}

      {!loading && filtered.length === 0 && (
        <div className="empty">No tasks match — try clearing filters or create a new task.</div>
      )}

      <section className="task-grid" aria-live="polite">
        {filtered.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </section>

      {/* Modal-ish form */}
      {showForm && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={editing ? 'Edit task' : 'Create task'}>
          <form onSubmit={handleSubmit(onSubmit)} className="task-form">
            <h2>{editing ? 'Edit Task' : 'New Task'}</h2>
            <label>
              Title
              <input {...register('title', { required: true })} aria-required />
            </label>
            <label>
              Description
              <textarea {...register('description')} />
            </label>
            <label>
              Status
              <select {...register('status')}>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              Tags (comma separated)
              <input {...register('tags')} />
            </label>
            <label>
              Due date
              <input type="date" {...register('dueDate')} />
            </label>

            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        main { padding: 16px; max-width: 920px; margin: 0 auto; }
        .page-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:12px; }
        .task-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; }
        .empty { padding:24px; text-align:center; color:var(--muted,#666); border:1px dashed rgba(0,0,0,0.04); border-radius:8px; }

        .modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.35); padding:16px; }
        .task-form { background:var(--card-bg,white); padding:16px; border-radius:8px; width:100%; max-width:560px; box-shadow:0 6px 24px rgba(0,0,0,0.12); display:flex; flex-direction:column; gap:8px; }
        .task-form label { display:flex; flex-direction:column; gap:6px; font-size:.95rem; }
        .task-form input, .task-form textarea, .task-form select { padding:8px; border-radius:6px; border:1px solid rgba(0,0,0,0.08); }
        .form-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:8px; }

        @media (max-width:720px) {
          .task-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}