import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, initDb, type Card } from '@/lib/db';

const reviewSchema = z.object({
  correct: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid review payload' }, { status: 400 });
    }

    const { correct } = parsed.data;

    await initDb();
    const db = getDb();

    const existing = await db.execute({
      sql: 'SELECT * FROM cards WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    const cardRow = existing.rows[0];
    const currentBox = Number(cardRow.box);
    const currentStreak = Number(cardRow.streak);
    const reviewCount = Number(cardRow.review_count) + 1;
    const now = Date.now();

    let newBox = currentBox;
    let newStreak = currentStreak;

    if (correct) {
      newStreak += 1;
      if (currentBox === 1) {
        newBox = 2; // Move to Weekly
      } else if (currentBox === 2) {
        newBox = 3; // Move to Monthly
      } else {
        newBox = 3; // Box 3 stays in Box 3
      }
    } else {
      // Wrong answer drops back to Box 1 (Revised daily)
      newBox = 1;
      newStreak = 0;
    }

    await db.execute({
      sql: `UPDATE cards SET box = ?, last_reviewed_at = ?, review_count = ?, streak = ? WHERE id = ?`,
      args: [newBox, now, reviewCount, newStreak, id],
    });

    const updatedCard: Card = {
      id,
      question: String(cardRow.question),
      answer: String(cardRow.answer),
      box: newBox,
      created_at: Number(cardRow.created_at),
      last_reviewed_at: now,
      review_count: reviewCount,
      streak: newStreak,
    };

    return NextResponse.json({
      success: true,
      card: updatedCard,
      previousBox: currentBox,
      newBox,
      graduated: correct && newBox > currentBox,
      demoted: !correct && currentBox > 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Review action failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
