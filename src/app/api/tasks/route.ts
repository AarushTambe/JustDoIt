import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { TaskCreateSchema } from '@/lib/validations';
import { broadcastTaskEvent } from '@/lib/events';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const group = searchParams.get('group')?.trim() || '';
    const subgroup = searchParams.get('subgroup')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const assignedUser = searchParams.get('assignedUser')?.trim() || '';
    const starred = searchParams.get('starred');
    const isDeletedParam = searchParams.get('isDeleted');

    const isDeleted = isDeletedParam === 'true';

    const where: any = {
      isDeleted: isDeleted,
    };

    if (group) {
      where.groupName = group;
    }
    if (subgroup) {
      where.subgroupName = subgroup;
    }
    if (status) {
      where.status = status;
    }
    if (assignedUser) {
      where.assignedUser = assignedUser;
    }
    if (starred === 'true') {
      where.isStarred = true;
    }

    let tasks = await db.task.findMany({
      where,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [
        { isStarred: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    if (q) {
      const lowerQ = q.toLowerCase();
      tasks = tasks.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(lowerQ);
        const descMatch = t.description?.toLowerCase().includes(lowerQ) ?? false;
        const groupMatch = t.groupName.toLowerCase().includes(lowerQ);
        const subgroupMatch = t.subgroupName?.toLowerCase().includes(lowerQ) ?? false;
        const tagMatch = t.tags.toLowerCase().includes(lowerQ);
        return titleMatch || descMatch || groupMatch || subgroupMatch || tagMatch;
      });
    }

    const formattedTasks = tasks.map((t) => ({
      ...t,
      tags: JSON.parse(t.tags || '[]'),
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to retrieve tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = TaskCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid task input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const input = result.data;
    const task = await db.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        assignedUser: input.assignedUser ?? null,
        tags: JSON.stringify(input.tags),
        groupName: input.groupName,
        subgroupName: input.subgroupName ?? null,
        status: input.status,
        isStarred: input.isStarred,
      },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const parsedTask = {
      ...task,
      tags: JSON.parse(task.tags),
    };

    broadcastTaskEvent({
      type: 'TASK_CREATED',
      taskId: task.id,
      timestamp: task.updatedAt.toISOString(),
      payload: parsedTask,
    });

    return NextResponse.json(parsedTask, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}