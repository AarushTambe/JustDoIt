import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { NoteCreateSchema } from '@/lib/validations';
import { broadcastTaskEvent } from '@/lib/events';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await db.note.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Failed to retrieve notes:', error);
    return NextResponse.json({ error: 'Failed to retrieve notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = NoteCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid note input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const username = session.username || 'User A';
    const note = await db.note.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        author: username,
        updatedBy: username,
      },
    });

    broadcastTaskEvent({
      type: 'NOTE_CREATED',
      noteId: note.id,
      timestamp: note.updatedAt.toISOString(),
      payload: note,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}