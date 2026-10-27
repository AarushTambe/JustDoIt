'use client';

import { useState } from 'react';
import { Star, CheckCircle, Clock, Tag, Folder, User, Edit3, Trash2, Plus, X, Check } from 'lucide-react';
import { TaskStatus } from '@/lib/validations';

export interface SubtaskData {
  id: string;
  title: string;
  assignedUser?: string | null;
  isCompleted: boolean;
  parentTaskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  assignedUser?: string | null;
  tags: string[];
  groupName: string;
  subgroupName?: string | null;
  status: TaskStatus;
  isStarred: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  subtasks?: SubtaskData[];
}

interface TaskItemProps {
  task: TaskData;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  onEdit: (task: TaskData) => void;
  onDelete: (id: string) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  onSubtaskAdd: (taskId: string, title: string, assignedUser: string | null) => void;
  onSubtaskDelete: (taskId: string, subtaskId: string) => void;
}

export default function TaskItem({
  task,
  onStatusChange,
  onToggleStar,
  onEdit,
  onDelete,
  onSubtaskToggle,
  onSubtaskAdd,
  onSubtaskDelete,
}: TaskItemProps) {
  const isDone = task.status === 'DONE';
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState<string>('Unassigned');

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'TODO': return 'badge-todo';
      case 'IN_PROGRESS': return 'badge-in_progress';
      case 'DONE': return 'badge-done';
    }
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.isCompleted).length;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onSubtaskAdd(task.id, newSubtaskTitle.trim(), newSubtaskAssignee === 'Unassigned' ? null : newSubtaskAssignee);
    setNewSubtaskTitle('');
    setNewSubtaskAssignee('Unassigned');
    setShowAddSubtask(false);
  };

  return (
    <div
      className="apple-card"
      style={{
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        borderLeft: task.isStarred ? '4px solid var(--accent-star)' : '1px solid var(--border-subtle)',
        backgroundColor: task.isStarred ? 'rgba(255, 149, 0, 0.03)' : 'var(--bg-card)',
        opacity: isDone ? 0.75 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span className={`badge ${getStatusBadgeClass(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-sidebar)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}>
              <Folder size={12} />
              {task.groupName} {task.subgroupName ? `/ ${task.subgroupName}` : ''}
            </span>

            {task.assignedUser && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                color: 'var(--accent-blue)',
                backgroundColor: 'rgba(0, 113, 227, 0.08)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
              }}>
                <User size={12} />
                {task.assignedUser}
              </span>
            )}
          </div>

          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            textDecoration: isDone ? 'line-through' : 'none',
            color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
          }}>
            {task.title}
          </h3>

          {task.description && (
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '0.3rem',
              whiteSpace: 'pre-wrap',
            }}>
              {task.description}
            </p>
          )}
        </div>

        <button
          onClick={() => onToggleStar(task.id, task.isStarred)}
          className="btn-icon"
          title={task.isStarred ? 'Unstar task' : 'Star task'}
          style={{ color: task.isStarred ? 'var(--accent-star)' : 'var(--text-tertiary)' }}
        >
          <Star size={20} fill={task.isStarred ? 'var(--accent-star)' : 'none'} />
        </button>
      </div>

      {/* Subtasks Section */}
      {(subtasks.length > 0 || showAddSubtask) && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.6rem',
          marginTop: '0.2rem',
        }}>
          {subtasks.length > 0 && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              fontWeight: 500,
            }}>
              Subtasks ({completedCount}/{subtasks.length})
            </div>
          )}

          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0',
                fontSize: '0.88rem',
              }}
            >
              <input
                type="checkbox"
                checked={subtask.isCompleted}
                onChange={() => onSubtaskToggle(task.id, subtask.id, !subtask.isCompleted)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{
                flex: 1,
                textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                color: subtask.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
              }}>
                {subtask.title}
              </span>
              {subtask.assignedUser && (
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--accent-blue)',
                  backgroundColor: 'rgba(0, 113, 227, 0.08)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  flexShrink: 0,
                }}>
                  {subtask.assignedUser}
                </span>
              )}
              <button
                onClick={() => onSubtaskDelete(task.id, subtask.id)}
                className="btn-icon"
                title="Remove subtask"
                style={{ width: '22px', height: '22px', color: 'var(--text-tertiary)', flexShrink: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {showAddSubtask && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.4rem',
            }}>
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Subtask title..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); }}
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.3rem 0.5rem' }}
                autoFocus
              />
              <select
                value={newSubtaskAssignee}
                onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.4rem' }}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="User A">User A</option>
                <option value="User B">User B</option>
              </select>
              <button
                onClick={handleAddSubtask}
                className="btn-icon"
                title="Add subtask"
                style={{ width: '26px', height: '26px', color: 'var(--accent-blue)' }}
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setShowAddSubtask(false); setNewSubtaskTitle(''); }}
                className="btn-icon"
                title="Cancel"
                style={{ width: '26px', height: '26px' }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Meta tags and due date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', paddingTop: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {formattedDueDate && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: new Date(task.dueDate!).getTime() < Date.now() && !isDone ? 'var(--accent-danger)' : 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              <Clock size={13} />
              {formattedDueDate}
            </span>
          )}

          {task.tags && task.tags.length > 0 && task.tags.map((tag) => (
            <span key={tag} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-input)',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
            }}>
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setShowAddSubtask(true)}
            className="btn-icon"
            title="Add subtask"
            style={{ width: '30px', height: '30px', color: 'var(--text-secondary)' }}
          >
            <Plus size={15} />
          </button>

          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <button
            onClick={() => onEdit(task)}
            className="btn-icon"
            title="Edit Task"
            style={{ width: '30px', height: '30px' }}
          >
            <Edit3 size={15} />
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="btn-icon"
            title="Move to Trash"
            style={{ width: '30px', height: '30px', color: 'var(--accent-danger)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
