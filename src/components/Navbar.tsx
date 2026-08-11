'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Sun, Moon, LogOut, UserCheck, RefreshCw, Bell } from 'lucide-react';

interface NavbarProps {
  onSearchChange: (q: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenTrashModal: () => void;
  currentUser: string;
  onLogout: () => void;
  isConnected: boolean;
  onRefresh: () => void;
  onEnableNotifications: () => void;
  notificationsEnabled: boolean;
}

export default function Navbar({
  onSearchChange,
  onOpenNewTaskModal,
  onOpenTrashModal,
  currentUser,
  onLogout,
  isConnected,
  onRefresh,
  onEnableNotifications,
  notificationsEnabled,
}: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('aedoit_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('aedoit_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearchChange(val);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.8rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ color: 'var(--accent-blue)' }}>Ae</span>Doit
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: isConnected ? 'var(--accent-success)' : 'var(--text-tertiary)',
          backgroundColor: isConnected ? 'rgba(52, 199, 89, 0.1)' : 'var(--bg-input)',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isConnected ? 'var(--accent-success)' : 'var(--text-tertiary)',
          }} />
          {isConnected ? 'Live Sync' : 'Reconnecting...'}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder="Search tasks, groups, tags..."
          style={{
            width: '100%',
            paddingLeft: '2.4rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-input)',
            border: 'none',
          }}
        />
        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          onClick={onOpenNewTaskModal}
          className="btn-primary"
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          New Task
        </button>

        <button
          onClick={onOpenTrashModal}
          className="btn-icon"
          title="Trash / Recoverable Deletion"
        >
          <Trash2 size={18} />
        </button>

        <button
          onClick={onEnableNotifications}
          className="btn-icon"
          title={notificationsEnabled ? "Notifications Active" : "Enable Web Notifications"}
          style={{ color: notificationsEnabled ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
        >
          <Bell size={18} />
        </button>

        <button
          onClick={onRefresh}
          className="btn-icon"
          title="Force Refresh Data"
        >
          <RefreshCw size={18} />
        </button>

        <button
          onClick={toggleTheme}
          className="btn-icon"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.6rem',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 500,
        }}>
          <UserCheck size={14} style={{ color: 'var(--accent-blue)' }} />
          {currentUser}
        </div>

        <button
          onClick={onLogout}
          className="btn-icon"
          title="Sign Out"
          style={{ color: 'var(--accent-danger)' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
