import { EventEmitter } from 'events';

class TaskEventEmitter extends EventEmitter {}

const globalForEvents = globalThis as unknown as {
  taskEmitter: TaskEventEmitter | undefined;
};

export const taskEmitter = globalForEvents.taskEmitter ?? new TaskEventEmitter();
taskEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') globalForEvents.taskEmitter = taskEmitter;

export interface TaskChangeEvent {
  type:
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_DELETED'
    | 'TASK_RESTORED'
    | 'TASK_PERMANENTLY_DELETED'
    | 'SUBTASK_CREATED'
    | 'SUBTASK_UPDATED'
    | 'SUBTASK_DELETED'
    | 'NOTE_CREATED'
    | 'NOTE_UPDATED'
    | 'NOTE_DELETED';
  taskId?: string;
  noteId?: string;
  timestamp: string;
  payload?: any;
}

export function broadcastTaskEvent(event: TaskChangeEvent) {
  taskEmitter.emit('taskChange', event);
}