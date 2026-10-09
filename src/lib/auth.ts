import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb, initDb } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'leitner-secure-flow-neo-brutalism-salt-2026';
const TOKEN_MAX_AGE_HOURS = 12;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + TOKEN_MAX_AGE_HOURS * 3600 * 1000;
  const payload = JSON.stringify({ admin: true, exp: expiresAt });
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}::${hmac}`).toString('base64');
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [payload, hmac] = decoded.split('::');
    if (!payload || !hmac) return false;

    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
    if (!isValidSignature) return false;

    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return false;
    return Boolean(data.admin);
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT value FROM settings WHERE key = ?',
    args: ['edit_password_hash'],
  });

  if (result.rows.length === 0) return false;
  const hash = String(result.rows[0].value);
  return bcrypt.compare(password, hash);
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  await initDb();
  const db = getDb();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  await db.execute({
    sql: 'UPDATE settings SET value = ? WHERE key = ?',
    args: [hash, 'edit_password_hash'],
  });
}
