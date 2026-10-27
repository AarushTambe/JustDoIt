'use client';

import { useState } from 'react';
import { FileText, Plus, Edit3, Trash2, Check, X, User } from 'lucide-react';

export interface NoteData {
  id: string;
  title: string;
  content: string;
  author: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesSectionProps {
  notes: NoteData[];
  onCreateNote: (title: string, content: string) => Promise<void>;
  onUpdateNote: (id: string, title: string, content: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export default function NotesSection({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: NotesSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await onCreateNote(newTitle.trim(), newContent.trim());
      setNewTitle('');
      setNewContent('');
      setIsCreating(false);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (note: NoteData) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;
    setSubmitting(true);
    try {
      await onUpdateNote(id, editTitle.trim(), editContent.trim());
      setEditingId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} style={{ color: 'var(--accent-blue)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Shared Notes</h2>
          <span className="badge badge-todo">{notes.length}</span>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <Plus size={15} />
            New Note
          </button>
        )}
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="apple-card"
          style={{ padding: '1.2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Note title..."
            required
            autoFocus
            style={{ width: '100%', fontWeight: 600 }}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write shared note content..."
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewTitle('');
                setNewContent('');
              }}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            >
              {submitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !isCreating ? (
        <div className="apple-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          No shared notes yet. Create one to share context with the team.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {notes.map((note) => {
            const isEditing = editingId === note.id;
            const formattedDate = new Date(note.updatedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={note.id}
                className="apple-card"
                style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.8rem' }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ width: '100%', fontWeight: 600 }}
                      autoFocus
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-icon"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(note.id)}
                        disabled={submitting}
                        className="btn-icon"
                        title="Save changes"
                        style={{ color: 'var(--accent-blue)' }}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {note.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <button
                            onClick={() => startEditing(note)}
                            className="btn-icon"
                            title="Edit Note"
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="btn-icon"
                            title="Delete Note"
                            style={{ width: '28px', height: '28px', color: 'var(--accent-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {note.content && (
                        <p style={{
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.5rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {note.content}
                        </p>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: 'var(--text-tertiary)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.5rem',
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={11} />
                        Updated by {note.updatedBy}
                      </span>
                      <span>{formattedDate}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}