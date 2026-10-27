import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const AllowedAssigneeEnum = z.enum(['User A', 'User B']);

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
  expectedUpdatedAt: z.string().optional(),
});

export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;

export const SubtaskCreateSchema = z.object({
  title: z.string().trim().min(1, 'Subtask title is required').max(250, 'Subtask title is too long'),
  assignedUser: AllowedAssigneeEnum.nullable().optional().default(null),
});

export type SubtaskCreateInput = z.infer<typeof SubtaskCreateSchema>;

export const SubtaskUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Subtask title is required').max(250, 'Subtask title is too long').optional(),
  assignedUser: AllowedAssigneeEnum.nullable().optional(),
  isCompleted: z.boolean().optional(),
});

export type SubtaskUpdateInput = z.infer<typeof SubtaskUpdateSchema>;

export const NoteCreateSchema = z.object({
  title: z.string().trim().min(1, 'Note title is required').max(250, 'Note title is too long'),
  content: z.string().trim().max(20000, 'Note content is too long').default(''),
});

export type NoteCreateInput = z.infer<typeof NoteCreateSchema>;

export const NoteUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Note title is required').max(250, 'Note title is too long').optional(),
  content: z.string().trim().max(20000, 'Note content is too long').optional(),
});

export type NoteUpdateInput = z.infer<typeof NoteUpdateSchema>;

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