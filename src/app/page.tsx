'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TaskItem, { TaskData } from '@/components/TaskItem';
import TaskModal from '@/components/TaskModal';
import TrashModal from '@/components/TrashModal';
import NotesSection, { NoteData } from '@/components/NotesSection';
import { TaskStatus } from '@/lib/validations';
import { CheckCircle2, Star, ListFilter } from 'lucide-react';

export default function WorkspacePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string>('User A');
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [starredFilter, setStarredFilter] = useState<boolean>(false);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

  // Fetch current user session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.username) {
          setCurrentUser(data.username);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Fetch active tasks from API
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set('q', searchQuery);
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);
      if (groupFilter !== 'ALL') queryParams.set('group', groupFilter);
      if (assigneeFilter !== 'ALL') queryParams.set('assignedUser', assigneeFilter);
      if (starredFilter) queryParams.set('starred', 'true');

      const res = await fetch(`/api/tasks?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, groupFilter, assigneeFilter, starredFilter]);

  // Fetch shared notes from API
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchNotes();
  }, [fetchTasks, fetchNotes]);

  // Setup Server-Sent Events (SSE) for instant real-time synchronization
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('taskChange', (event: MessageEvent) => {
        try {
          const changeData = JSON.parse(event.data);
          const { type, taskId, noteId, payload } = changeData;

          if (type === 'TASK_CREATED' && payload) {
            setTasks((prev) => {
              if (prev.some((t) => t.id === taskId)) return prev;
              return [payload, ...prev];
            });

            if (notificationsEnabled && Notification.permission === 'granted') {
              new Notification('AeDoit New Task', {
                body: `New Task: "${payload.title}" created.`,
                icon: '/icon-192.png',
              });
            }
          } else if (type === 'TASK_UPDATED' && payload) {
            setTasks((prev) =>
              prev.map((t) => (t.id === taskId ? payload : t))
            );
          } else if (type === 'TASK_DELETED' || type === 'TASK_PERMANENTLY_DELETED') {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
          } else if (type === 'TASK_RESTORED' && payload) {
            setTasks((prev) => {
              if (prev.some((t) => t.id === taskId)) return prev;
              return [payload, ...prev];
            });
          } else if (type === 'SUBTASK_CREATED' && payload && taskId) {
            setTasks((prev) =>
              prev.map((t) => {
                if (t.id !== taskId) return t;
                const existing = t.subtasks || [];
                if (existing.some((s) => s.id === payload.id)) return t;
                return { ...t, subtasks: [...existing, payload] };
              })
            );
          } else if (type === 'SUBTASK_UPDATED' && payload && taskId) {
            setTasks((prev) =>
              prev.map((t) => {
                if (t.id !== taskId) return t;
                const existing = t.subtasks || [];
                return {
                  ...t,
                  subtasks: existing.map((s) => (s.id === payload.id ? payload : s)),
                };
              })
            );
          } else if (type === 'SUBTASK_DELETED' && payload && taskId) {
            setTasks((prev) =>
              prev.map((t) => {
                if (t.id !== taskId) return t;
                const existing = t.subtasks || [];
                return {
                  ...t,
                  subtasks: existing.filter((s) => s.id !== payload.id),
                };
              })
            );
          } else if (type === 'NOTE_CREATED' && payload) {
            setNotes((prev) => {
              if (prev.some((n) => n.id === payload.id)) return prev;
              return [payload, ...prev];
            });
          } else if (type === 'NOTE_UPDATED' && payload) {
            setNotes((prev) =>
              prev.map((n) => (n.id === payload.id ? payload : n))
            );
          } else if (type === 'NOTE_DELETED' && noteId) {
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
          }
        } catch {
          // ignore
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        if (eventSource) eventSource.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [notificationsEnabled]);

  // Web Notifications request
  const handleEnableNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('AeDoit Notifications', {
            body: 'Live task alerts are now active.',
            icon: '/icon-192.png',
          });
        }
      });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  // Task Mutations
  const handleSaveTask = async (taskData: Partial<TaskData>) => {
    if (taskData.id) {
      const res = await fetch(`/api/tasks/${taskData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error('Failed to create task');
      const created = await res.json();
      setTasks((prev) => {
        if (prev.some((t) => t.id === created.id)) return prev;
        return [created, ...prev];
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    const nextStarred = !currentStarred;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isStarred: nextStarred } : t))
    );
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: nextStarred }),
    });
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  };

  // Subtask Mutations
  const handleSubtaskAdd = async (taskId: string, title: string, assignedUser: string | null) => {
    const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, assignedUser }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const existing = t.subtasks || [];
          if (existing.some((s) => s.id === created.id)) return t;
          return { ...t, subtasks: [...existing, created] };
        })
      );
    }
  };

  const handleSubtaskToggle = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, isCompleted } : s
          ),
        };
      })
    );

    const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: (t.subtasks || []).map((s) => (s.id === subtaskId ? updated : s)),
          };
        })
      );
    }
  };

  const handleSubtaskDelete = async (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
        };
      })
    );

    await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  };

  // Shared Note Mutations
  const handleCreateNote = async (title: string, content: string) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      const created = await res.json();
      setNotes((prev) => {
        if (prev.some((n) => n.id === created.id)) return prev;
        return [created, ...prev];
      });
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  };

  const handleRefreshAll = () => {
    fetchTasks();
    fetchNotes();
  };

  const uniqueGroups = Array.from(new Set(tasks.map((t) => t.groupName).filter(Boolean)));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar
        onSearchChange={setSearchQuery}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenTrashModal={() => setIsTrashModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        isConnected={isConnected}
        onRefresh={handleRefreshAll}
        onEnableNotifications={handleEnableNotifications}
        notificationsEnabled={notificationsEnabled}
      />

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Controls & Filter Bar */}
        <div className="apple-card" style={{ padding: '0.8rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <ListFilter size={16} />
              Filters:
            </div>

            {/* Status Filter buttons */}
            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-sidebar)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
              {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: statusFilter === st ? 'var(--bg-card)' : 'transparent',
                    color: statusFilter === st ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: statusFilter === st ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Group Filter Dropdown */}
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="ALL">All Groups</option>
              <option value="Aethron">Aethron</option>
              {uniqueGroups.filter((g) => g !== 'Aethron').map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Assignee Filter Dropdown */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="ALL">All Assignees</option>
              <option value="User A">User A</option>
              <option value="User B">User B</option>
            </select>
          </div>

          <button
            onClick={() => setStarredFilter(!starredFilter)}
            className="btn-secondary"
            style={{
              padding: '0.35rem 0.8rem',
              fontSize: '0.8rem',
              color: starredFilter ? 'var(--accent-star)' : 'var(--text-secondary)',
              borderColor: starredFilter ? 'var(--accent-star)' : 'var(--border-subtle)',
            }}
          >
            <Star size={14} fill={starredFilter ? 'var(--accent-star)' : 'none'} />
            Starred Only
          </button>
        </div>

        {/* Task List Section */}
        {loading ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="apple-card" style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '1rem' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>No tasks found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your workspace is clear or matches no active filters.
            </p>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="btn-primary"
            >
              Create New Task
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onToggleStar={handleToggleStar}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onSubtaskAdd={handleSubtaskAdd}
                onSubtaskToggle={handleSubtaskToggle}
                onSubtaskDelete={handleSubtaskDelete}
              />
            ))}
          </div>
        )}

        {/* Shared Notes Section */}
        <NotesSection
          notes={notes}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
        currentUser={currentUser}
      />

      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        onTaskRestored={fetchTasks}
      />
    </div>
  );
}