import { describe, it, expect } from 'vitest';
import { TaskCreateSchema, TaskUpdateSchema, LoginSchema } from '@/lib/validations';

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
});
