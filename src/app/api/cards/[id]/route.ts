import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getDb, initDb, type Card } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

const updateCardSchema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty').max(1000, 'Question too long').optional(),
  answer: z.string().trim().min(1, 'Answer cannot be empty').max(2000, 'Answer too long').optional(),
  box: z.number().int().min(1).max(3).optional(),
});

async function checkAuth(req: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('leitner_session')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  return verifySessionToken(token);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await checkAuth(req);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Edit mode password required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    await initDb();
    const db = getDb();

    // Check if card exists
    const existing = await db.execute({
      sql: 'SELECT * FROM cards WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    const current = existing.rows[0];
    const newQuestion = parsed.data.question ?? String(current.question);
    const newAnswer = parsed.data.answer ?? String(current.answer);
    const newBox = parsed.data.box ?? Number(current.box);

    await db.execute({
      sql: 'UPDATE cards SET question = ?, answer = ?, box = ? WHERE id = ?',
      args: [newQuestion, newAnswer, newBox, id],
    });

    const updatedCard: Card = {
      id,
      question: newQuestion,
      answer: newAnswer,
      box: newBox,
      created_at: Number(current.created_at),
      last_reviewed_at: current.last_reviewed_at ? Number(current.last_reviewed_at) : null,
      review_count: Number(current.review_count),
      streak: Number(current.streak),
    };

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await checkAuth(req);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Edit mode password required' }, { status: 401 });
    }

    const { id } = await params;
    await initDb();
    const db = getDb();

    const result = await db.execute({
      sql: 'DELETE FROM cards WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Card deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
