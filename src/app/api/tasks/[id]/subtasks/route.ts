import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SubtaskCreateSchema } from '@/lib/validations';
import { broadcastTaskEvent } from '@/lib/events';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parentTask = await db.task.findUnique({
      where: { id: params.id },
    });

    if (!parentTask || parentTask.isDeleted) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = SubtaskCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid subtask input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const subtask = await db.subtask.create({
      data: {
        title: result.data.title,
        assignedUser: result.data.assignedUser ?? null,
        parentTaskId: params.id,
      },
    });

    broadcastTaskEvent({
      type: 'SUBTASK_CREATED',
      taskId: params.id,
      timestamp: subtask.updatedAt.toISOString(),
      payload: subtask,
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error('Failed to create subtask:', error);
    return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 });
  }
}