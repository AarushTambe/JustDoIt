'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { TaskData } from './TaskItem';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskRestored: () => void;
}

export default function TrashModal({ isOpen, onClose, onTaskRestored }: TrashModalProps) {
  const [deletedTasks, setDeletedTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks?isDeleted=true');
      if (res.ok) {
        const data = await res.json();
        setDeletedTasks(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrash();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/tasks/${id}/restore`, { method: 'POST' });
      if (res.ok) {
        setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
        onTaskRestored();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this task? This cannot be undone.')) {
      return;
    }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Trash2 size={20} style={{ color: 'var(--accent-danger)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recoverable Trash</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 159, 10, 0.1)',
          color: 'var(--accent-warning)',
          padding: '0.6rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertTriangle size={16} />
          Deleted tasks are stored safely here until permanently purged.
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading deleted tasks...
          </div>
        ) : deletedTasks.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Trash is currently empty.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '50vh', overflowY: 'auto' }}>
            {deletedTasks.map((task) => (
              <div
                key={task.id}
                className="apple-card"
                style={{
                  padding: '0.8rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Group: {task.groupName} {task.subgroupName ? `/ ${task.subgroupName}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleRestore(task.id)}
                    disabled={actionLoading === task.id}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(task.id)}
                    disabled={actionLoading === task.id}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-danger)' }}
                  >
                    Purge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
