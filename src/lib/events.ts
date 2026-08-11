import { EventEmitter } from 'events';

class TaskEventEmitter extends EventEmitter {}

const globalForEvents = globalThis as unknown as {
  taskEmitter: TaskEventEmitter | undefined;
};

export const taskEmitter = globalForEvents.taskEmitter ?? new TaskEventEmitter();
taskEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') globalForEvents.taskEmitter = taskEmitter;

export interface TaskChangeEvent {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'TASK_RESTORED' | 'TASK_PERMANENTLY_DELETED';
  taskId: string;
  timestamp: string;
  payload?: any;
}

export function broadcastTaskEvent(event: TaskChangeEvent) {
  taskEmitter.emit('taskChange', event);
}
