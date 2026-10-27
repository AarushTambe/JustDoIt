import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { TaskUpdateSchema } from '@/lib/validations';
import { broadcastTaskEvent } from '@/lib/events';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({
      where: { id: params.id },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...task,
      tags: JSON.parse(task.tags || '[]'),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = TaskUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid update input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existingTask = await db.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const input = result.data;
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.dueDate !== undefined)
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.assignedUser !== undefined) updateData.assignedUser = input.assignedUser;
    if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);
    if (input.groupName !== undefined) updateData.groupName = input.groupName;
    if (input.subgroupName !== undefined) updateData.subgroupName = input.subgroupName;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.isStarred !== undefined) updateData.isStarred = input.isStarred;

    const updatedTask = await db.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const parsedTask = {
      ...updatedTask,
      tags: JSON.parse(updatedTask.tags),
    };

    broadcastTaskEvent({
      type: 'TASK_UPDATED',
      taskId: updatedTask.id,
      timestamp: updatedTask.updatedAt.toISOString(),
      payload: parsedTask,
    });

    return NextResponse.json(parsedTask);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTask = await db.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!existingTask.isDeleted) {
      const softDeletedTask = await db.task.update({
        where: { id: params.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
        include: {
          subtasks: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      const parsedTask = {
        ...softDeletedTask,
        tags: JSON.parse(softDeletedTask.tags),
      };

      broadcastTaskEvent({
        type: 'TASK_DELETED',
        taskId: softDeletedTask.id,
        timestamp: softDeletedTask.updatedAt.toISOString(),
        payload: parsedTask,
      });

      return NextResponse.json({ success: true, mode: 'soft', task: parsedTask });
    } else {
      await db.task.delete({
        where: { id: params.id },
      });

      broadcastTaskEvent({
        type: 'TASK_PERMANENTLY_DELETED',
        taskId: params.id,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, mode: 'permanent', id: params.id });
    }
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}