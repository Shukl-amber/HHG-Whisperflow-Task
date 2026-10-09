import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getDb, initDb, type Card } from '@/lib/db';

const createCardSchema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty').max(1000, 'Question too long'),
  answer: z.string().trim().min(1, 'Answer cannot be empty').max(2000, 'Answer too long'),
  box: z.number().int().min(1).max(3).default(1),
});

export async function GET(req: Request) {
  try {
    await initDb();
    const db = getDb();
    const url = new URL(req.url);
    const boxParam = url.searchParams.get('box');

    let query = 'SELECT * FROM cards ORDER BY created_at DESC';
    let args: (string | number)[] = [];

    if (boxParam && ['1', '2', '3'].includes(boxParam)) {
      query = 'SELECT * FROM cards WHERE box = ? ORDER BY created_at DESC';
      args = [parseInt(boxParam, 10)];
    }

    const result = await db.execute({ sql: query, args });

    const cards: Card[] = result.rows.map((row) => ({
      id: String(row.id),
      question: String(row.question),
      answer: String(row.answer),
      box: Number(row.box),
      created_at: Number(row.created_at),
      last_reviewed_at: row.last_reviewed_at ? Number(row.last_reviewed_at) : null,
      review_count: Number(row.review_count),
      streak: Number(row.streak),
    }));

    return NextResponse.json({ success: true, cards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
    const body = await req.json();
    const parsed = createCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid card payload' },
        { status: 400 }
      );
    }

    const { question, answer, box } = parsed.data;
    const db = getDb();
    const newId = `card-${crypto.randomUUID()}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO cards (id, question, answer, box, created_at, last_reviewed_at, review_count, streak)
            VALUES (?, ?, ?, ?, ?, NULL, 0, 0)`,
      args: [newId, question, answer, box, now],
    });

    const newCard: Card = {
      id: newId,
      question,
      answer,
      box,
      created_at: now,
      last_reviewed_at: null,
      review_count: 0,
      streak: 0,
    };

    return NextResponse.json({ success: true, card: newCard }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create card';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
