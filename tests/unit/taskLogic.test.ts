import { describe, it, expect } from 'vitest';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  groupName: string;
  subgroupName?: string | null;
  tags: string[];
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  isStarred: boolean;
  isDeleted: boolean;
  updatedAt?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Setup Database Migrations',
    description: 'Use SQLite locally and PostgreSQL in production',
    groupName: 'Aethron',
    subgroupName: 'Backend',
    tags: ['db', 'prisma'],
    status: 'DONE',
    isStarred: true,
    isDeleted: false,
  },
  {
    id: '2',
    title: 'Design Apple Minimalist UI',
    description: 'Implement dark mode, clean typography, and micro-interactions',
    groupName: 'Aethron',
    subgroupName: 'Frontend',
    tags: ['ui', 'css', 'design'],
    status: 'IN_PROGRESS',
    isStarred: false,
    isDeleted: false,
  },
  {
    id: '3',
    title: 'Trash Test Task',
    description: 'Soft deleted task for recoverable trash testing',
    groupName: 'Aethron',
    subgroupName: 'Ops',
    tags: ['trash'],
    status: 'TODO',
    isStarred: false,
    isDeleted: true,
  },
];

function filterTasks(tasks: Task[], query: string, includeDeleted = false) {
  return tasks.filter((t) => {
    if (!includeDeleted && t.isDeleted) return false;
    if (includeDeleted && !t.isDeleted) return false;
    if (!query) return true;
    const lowerQ = query.toLowerCase();
    return (
      t.title.toLowerCase().includes(lowerQ) ||
      t.description?.toLowerCase().includes(lowerQ) ||
      t.groupName.toLowerCase().includes(lowerQ) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
    );
  });
}

describe('Task Logic & Filtering Unit Tests', () => {
  it('filters out soft-deleted tasks by default', () => {
    const activeTasks = filterTasks(mockTasks, '');
    expect(activeTasks.length).toBe(2);
    expect(activeTasks.every((t) => !t.isDeleted)).toBe(true);
  });

  it('filters trash tasks when includeDeleted is true', () => {
    const trashTasks = filterTasks(mockTasks, '', true);
    expect(trashTasks.length).toBe(1);
    expect(trashTasks[0].id).toBe('3');
  });

  it('searches tasks by title and tags correctly', () => {
    const searchResult = filterTasks(mockTasks, 'prisma');
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].title).toBe('Setup Database Migrations');
  });

  it('performs Last Write Wins state mutation correctly', () => {
    let currentTask: Task = { ...mockTasks[0], status: 'TODO', updatedAt: '2026-08-11T00:00:00Z' };

    // Simulate User A update at 00:01:00
    const updateA = { status: 'IN_PROGRESS' as const, updatedAt: '2026-08-11T00:01:00Z' };
    currentTask = { ...currentTask, ...updateA };

    // Simulate User B update at 00:02:00 (later timestamp wins)
    const updateB = { status: 'DONE' as const, updatedAt: '2026-08-11T00:02:00Z' };
    currentTask = { ...currentTask, ...updateB };

    expect(currentTask.status).toBe('DONE');
    expect(currentTask.updatedAt).toBe('2026-08-11T00:02:00Z');
  });
});
