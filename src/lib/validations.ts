import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskCreateSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(250, 'Title is too long'),
  description: z.string().trim().nullable().optional(),
  dueDate: z.string().datetime().or(z.string().datetime({ offset: true })).or(z.string().date()).nullable().optional(),
  assignedUser: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim()).default([]),
  groupName: z.string().trim().min(1).default('Aethron'),
  subgroupName: z.string().trim().nullable().optional(),
  status: TaskStatusEnum.default('TODO'),
  isStarred: z.boolean().default(false),
});

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;

export const TaskUpdateSchema = TaskCreateSchema.partial().extend({
  expectedUpdatedAt: z.string().optional(), // For Last Write Wins concurrency validation if client supplies it
});

export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;

export const LoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  username: z.string().trim().optional().default('User A'),
});

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  group: z.string().optional(),
  subgroup: z.string().optional(),
  status: TaskStatusEnum.optional(),
  assignedUser: z.string().optional(),
  starred: z.string().transform((val) => val === 'true').optional(),
  includeDeleted: z.string().transform((val) => val === 'true').optional(),
});
