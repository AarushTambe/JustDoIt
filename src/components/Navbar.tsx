
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  RefreshCw,
  Bell,
} from 'lucide-react';

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
    const savedTheme = localStorage.getItem('aedoit_theme') as
      | 'light'
      | 'dark'
      | null;

    if (savedTheme === 'light' || savedTheme === 'dark') {
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
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  return (
    <header className="workspace-header">
      <div className="navbar-brand-row">
        <div className="navbar-brand" aria-label="AeDoit workspace">
          <span className="navbar-brand-ae">Ae</span>Doit
        </div>

        <div
          className={`navbar-sync ${isConnected ? 'is-connected' : 'is-disconnected'}`}
          role="status"
          aria-live="polite"
        >
          <span className="navbar-sync-dot" />
          {isConnected ? 'Live Sync' : 'Reconnecting…'}
        </div>
      </div>

      <div className="navbar-search">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={searchValue}
          onChange={handleSearch}
          placeholder="Search tasks, groups, tags..."
          aria-label="Search tasks, groups, and tags"
        />
        {searchValue && (
          <button
            type="button"
            className="navbar-clear-search"
            onClick={() => {
              setSearchValue('');
              onSearchChange('');
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="btn-primary navbar-new-task"
        >
          <Plus size={17} />
          <span>New Task</span>
        </button>

        <button
          type="button"
          onClick={onOpenTrashModal}
          className="btn-icon navbar-icon-button"
          title="Trash / Recoverable Deletion"
          aria-label="Open trash"
        >
          <Trash2 size={18} />
        </button>

        <button
          type="button"
          onClick={onEnableNotifications}
          className={`btn-icon navbar-icon-button ${notificationsEnabled ? 'is-active' : ''}`}
          title={notificationsEnabled ? 'Notifications Active' : 'Enable Web Notifications'}
          aria-label={notificationsEnabled ? 'Notifications active' : 'Enable notifications'}
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className="btn-icon navbar-icon-button"
          title="Refresh Data"
          aria-label="Refresh tasks and notes"
        >
          <RefreshCw size={18} />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="btn-icon navbar-icon-button"
          title="Toggle Light/Dark Theme"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="navbar-account-row">
        <div className="navbar-user" title={`Signed in as ${currentUser}`}>
          <UserCheck size={16} aria-hidden="true" />
          <span>{currentUser}</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="btn-icon navbar-logout"
          title="Sign Out"
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
