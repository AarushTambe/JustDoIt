'use client';

import { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag as TagIcon, User, Folder } from 'lucide-react';
import { TaskData } from './TaskItem';
import { TaskStatus } from '@/lib/validations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskData>) => Promise<void>;
  initialData?: TaskData | null;
  currentUser: string;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupName, setGroupName] = useState('Aethron');
  const [subgroupName, setSubgroupName] = useState('');
  const [assignedUser, setAssignedUser] = useState('User A');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [isStarred, setIsStarred] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setGroupName(initialData.groupName || 'Aethron');
      setSubgroupName(initialData.subgroupName || '');
      setAssignedUser(initialData.assignedUser || currentUser || 'User A');
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 10) : '');
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      setStatus(initialData.status);
      setIsStarred(initialData.isStarred);
    } else {
      setTitle('');
      setDescription('');
      setGroupName('Aethron');
      setSubgroupName('');
      setAssignedUser(currentUser || 'User A');
      setDueDate('');
      setTagsInput('');
      setStatus('TODO');
      setIsStarred(false);
    }
    setError('');
  }, [initialData, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim() || null,
        groupName: groupName.trim() || 'Aethron',
        subgroupName: subgroupName.trim() || null,
        assignedUser: assignedUser.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        tags: parsedTags,
        status,
        isStarred,
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save task');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            color: 'var(--accent-danger)',
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or subtasks..."
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Group
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Aethron"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Subgroup
              </label>
              <input
                type="text"
                value={subgroupName}
                onChange={(e) => setSubgroupName(e.target.value)}
                placeholder="e.g. Core, UI, Ops"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Assignee
              </label>
              <select
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="User A">User A</option>
                <option value="User B">User B</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                style={{ width: '100%' }}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="urgent, release, feature"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
            <input
              type="checkbox"
              id="star-checkbox"
              checked={isStarred}
              onChange={(e) => setIsStarred(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="star-checkbox" style={{ fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500 }}>
              Star this task (Favorite)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.2rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
