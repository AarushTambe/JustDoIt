import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { NoteUpdateSchema } from '@/lib/validations';
import { broadcastTaskEvent } from '@/lib/events';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingNote = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = NoteUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid note update input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedBy: session.username || 'User A',
    };

    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.content !== undefined) updateData.content = result.data.content;

    const updatedNote = await db.note.update({
      where: { id: params.id },
      data: updateData,
    });

    broadcastTaskEvent({
      type: 'NOTE_UPDATED',
      noteId: updatedNote.id,
      timestamp: updatedNote.updatedAt.toISOString(),
      payload: updatedNote,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
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

    const existingNote = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await db.note.delete({
      where: { id: params.id },
    });

    broadcastTaskEvent({
      type: 'NOTE_DELETED',
      noteId: params.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: params.id });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}