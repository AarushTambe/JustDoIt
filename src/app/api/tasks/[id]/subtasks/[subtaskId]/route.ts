import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SubtaskUpdateSchema } from '@/lib/validations';
import { broadcastTaskEvent } from '@/lib/events';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingSubtask = await db.subtask.findFirst({
      where: {
        id: params.subtaskId,
        parentTaskId: params.id,
      },
    });

    if (!existingSubtask) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = SubtaskUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid subtask update input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const input = result.data;
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.assignedUser !== undefined) updateData.assignedUser = input.assignedUser;
    if (input.isCompleted !== undefined) updateData.isCompleted = input.isCompleted;

    const updatedSubtask = await db.subtask.update({
      where: { id: params.subtaskId },
      data: updateData,
    });

    broadcastTaskEvent({
      type: 'SUBTASK_UPDATED',
      taskId: params.id,
      timestamp: updatedSubtask.updatedAt.toISOString(),
      payload: updatedSubtask,
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error('Failed to update subtask:', error);
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingSubtask = await db.subtask.findFirst({
      where: {
        id: params.subtaskId,
        parentTaskId: params.id,
      },
    });

    if (!existingSubtask) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    await db.subtask.delete({
      where: { id: params.subtaskId },
    });

    broadcastTaskEvent({
      type: 'SUBTASK_DELETED',
      taskId: params.id,
      timestamp: new Date().toISOString(),
      payload: { id: params.subtaskId, parentTaskId: params.id },
    });

    return NextResponse.json({ success: true, id: params.subtaskId });
  } catch (error) {
    console.error('Failed to delete subtask:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}