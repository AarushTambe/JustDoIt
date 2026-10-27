import { describe, it, expect } from 'vitest';
import {
  TaskCreateSchema,
  TaskUpdateSchema,
  SubtaskCreateSchema,
  SubtaskUpdateSchema,
  NoteCreateSchema,
  NoteUpdateSchema,
  LoginSchema,
} from '@/lib/validations';

describe('Zod Schema Validation Tests', () => {
  it('validates correct TaskCreate input', () => {
    const validInput = {
      title: 'Deploy AeDoit Application',
      description: 'Zero cost deployment to Vercel and Supabase',
      groupName: 'Aethron',
      subgroupName: 'DevOps',
      assignedUser: 'User A',
      tags: ['deployment', 'pwa'],
      status: 'TODO',
      isStarred: true,
    };

    const result = TaskCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Deploy AeDoit Application');
      expect(result.data.status).toBe('TODO');
      expect(result.data.isStarred).toBe(true);
    }
  });

  it('rejects empty title in TaskCreate input', () => {
    const invalidInput = {
      title: '   ',
      groupName: 'Aethron',
    };

    const result = TaskCreateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('defaults groupName to Aethron and status to TODO', () => {
    const minimalInput = {
      title: 'Clean Workspace Task',
    };

    const result = TaskCreateSchema.safeParse(minimalInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groupName).toBe('Aethron');
      expect(result.data.status).toBe('TODO');
    }
  });

  it('validates TaskUpdate input with partial fields', () => {
    const updateInput = {
      status: 'DONE',
      isStarred: false,
    };

    const result = TaskUpdateSchema.safeParse(updateInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('DONE');
      expect(result.data.isStarred).toBe(false);
    }
  });

  it('validates LoginSchema input', () => {
    const loginInput = {
      password: 'secret_passphrase',
      username: 'User B',
    };

    const result = LoginSchema.safeParse(loginInput);
    expect(result.success).toBe(true);
  });

  it('rejects empty password in LoginSchema', () => {
    const result = LoginSchema.safeParse({ password: '' });
    expect(result.success).toBe(false);
  });

  describe('Subtask Validation Schemas', () => {
    it('validates SubtaskCreateSchema with User A or User B or null', () => {
      const validUserA = SubtaskCreateSchema.safeParse({
        title: 'Write unit tests',
        assignedUser: 'User A',
      });
      expect(validUserA.success).toBe(true);

      const validUnassigned = SubtaskCreateSchema.safeParse({
        title: 'Review PR',
        assignedUser: null,
      });
      expect(validUnassigned.success).toBe(true);
    });

    it('rejects invalid assignee or empty title in SubtaskCreateSchema', () => {
      const invalidUser = SubtaskCreateSchema.safeParse({
        title: 'Subtask',
        assignedUser: 'User C',
      });
      expect(invalidUser.success).toBe(false);

      const emptyTitle = SubtaskCreateSchema.safeParse({
        title: '   ',
      });
      expect(emptyTitle.success).toBe(false);
    });

    it('validates independent completion toggle in SubtaskUpdateSchema', () => {
      const toggleResult = SubtaskUpdateSchema.safeParse({ isCompleted: true });
      expect(toggleResult.success).toBe(true);
      if (toggleResult.success) {
        expect(toggleResult.data.isCompleted).toBe(true);
      }
    });
  });

  describe('Shared Note Validation Schemas', () => {
    it('validates NoteCreateSchema and defaults empty content', () => {
      const res = NoteCreateSchema.safeParse({
        title: 'Sprint Retrospective Notes',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Sprint Retrospective Notes');
        expect(res.data.content).toBe('');
      }
    });

    it('rejects empty title in NoteCreateSchema', () => {
      const res = NoteCreateSchema.safeParse({
        title: '  ',
        content: 'Some content',
      });
      expect(res.success).toBe(false);
    });

    it('validates partial updates in NoteUpdateSchema', () => {
      const res = NoteUpdateSchema.safeParse({
        content: 'Updated meeting notes for User A and User B',
      });
      expect(res.success).toBe(true);
    });
  });
});