import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifySessionToken, verifyAdminPassword, updateAdminPassword } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters long').max(64, 'Password too long'),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('leitner_session')?.value || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session expired or invalid' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid password format' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const isCurrentValid = await verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    await updateAdminPassword(newPassword);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update password';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
