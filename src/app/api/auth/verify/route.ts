import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyAdminPassword,
  createSessionToken,
  getClientIp,
} from '@/lib/auth';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
} from '@/lib/rate-limit';

const verifySchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Security lockout active. Please try again in ${rateCheck.retryAfterSec}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminPassword(parsed.data.password);

    if (!isValid) {
      recordFailedAttempt(ip);
      const remaining = checkRateLimit(ip).remaining;
      return NextResponse.json(
        {
          success: false,
          error: `Incorrect password. ${remaining} attempts remaining before temporary lockout.`,
        },
        { status: 401 }
      );
    }

    // Success: clear rate limit and issue token
    clearRateLimit(ip);
    const token = createSessionToken();

    const response = NextResponse.json({
      success: true,
      token,
      message: 'Edit mode unlocked',
    });

    // Set secure HTTP-only cookie
    response.cookies.set('leitner_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 3600, // 12 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
