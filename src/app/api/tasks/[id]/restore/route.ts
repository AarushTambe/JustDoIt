import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { broadcastTaskEvent } from '@/lib/events';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existingTask = await db.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!existingTask.isDeleted) {
      return NextResponse.json({ error: 'Task is not in trash' }, { status: 400 });
    }

    const restoredTask = await db.task.update({
      where: { id: params.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    const parsedTask = {
      ...restoredTask,
      tags: JSON.parse(restoredTask.tags),
    };

    broadcastTaskEvent({
      type: 'TASK_RESTORED',
      taskId: restoredTask.id,
      timestamp: restoredTask.updatedAt.toISOString(),
      payload: parsedTask,
    });

    return NextResponse.json(parsedTask);
  } catch (error) {
    console.error('Failed to restore task:', error);
    return NextResponse.json({ error: 'Failed to restore task' }, { status: 500 });
  }
}
