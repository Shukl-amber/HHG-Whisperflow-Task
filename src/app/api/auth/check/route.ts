import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('leitner_session')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  const isValid = verifySessionToken(token);

  return NextResponse.json({ authenticated: isValid });
}
