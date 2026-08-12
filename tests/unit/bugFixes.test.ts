import { describe, it, expect } from 'vitest';
import { TaskCreateSchema } from '@/lib/validations';

describe('Bug Fix Verification Tests', () => {
  describe('TaskCreateSchema Due Date Validation', () => {
    it('accepts ISO datetime strings with Z suffix (e.g. from JS toISOString())', () => {
      const input = {
        title: 'Task with ISO Z due date',
        dueDate: new Date('2026-08-20T10:30:00Z').toISOString(),
      };

      const result = TaskCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBe('2026-08-20T10:30:00.000Z');
      }
    });

    it('accepts YYYY-MM-DD date strings', () => {
      const input = {
        title: 'Task with YYYY-MM-DD due date',
        dueDate: '2026-08-20',
      };

      const result = TaskCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts ISO datetime strings with explicit timezone offsets', () => {
      const input = {
        title: 'Task with offset due date',
        dueDate: '2026-08-20T10:30:00+05:30',
      };

      const result = TaskCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts null or missing due date', () => {
      const input = {
        title: 'Task with no due date',
        dueDate: null,
      };

      const result = TaskCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Task Array Deduplication Logic', () => {
    interface TaskMock {
      id: string;
      title: string;
    }

    const addDeduplicatedTask = (prev: TaskMock[], newTask: TaskMock): TaskMock[] => {
      if (prev.some((t) => t.id === newTask.id)) return prev;
      return [newTask, ...prev];
    };

    it('prevents duplicate task insertion when task ID already exists', () => {
      const initialTasks: TaskMock[] = [
        { id: 'task-1', title: 'Existing Task 1' },
        { id: 'task-2', title: 'Existing Task 2' },
      ];

      const duplicateTask: TaskMock = { id: 'task-1', title: 'Existing Task 1' };
      const updatedTasks = addDeduplicatedTask(initialTasks, duplicateTask);

      expect(updatedTasks.length).toBe(2);
      expect(updatedTasks).toBe(initialTasks);
    });

    it('successfully appends new non-duplicate task', () => {
      const initialTasks: TaskMock[] = [
        { id: 'task-1', title: 'Existing Task 1' },
      ];

      const newTask: TaskMock = { id: 'task-3', title: 'New Restored Task' };
      const updatedTasks = addDeduplicatedTask(initialTasks, newTask);

      expect(updatedTasks.length).toBe(2);
      expect(updatedTasks[0].id).toBe('task-3');
    });
  });
});
