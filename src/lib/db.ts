import { createClient, type Client } from '@libsql/client';
import bcrypt from 'bcryptjs';

// Singleton database connection
let clientInstance: Client | null = null;
let initPromise: Promise<void> | null = null;
let pragmasConfigured = false;

export function getDb(): Client {
  if (!clientInstance) {
    const url = process.env.TURSO_DATABASE_URL || 'file:leitner.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    clientInstance = createClient({
      url,
      authToken,
    });
  }
  return clientInstance;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  box: number; // 1 = Daily, 2 = Weekly, 3 = Monthly
  created_at: number;
  last_reviewed_at: number | null;
  review_count: number;
  streak: number;
}

export interface Setting {
  key: string;
  value: string;
}

async function configurePragmas(db: Client) {
  if (pragmasConfigured) return;
  try {
    // Only configure SQLite local PRAGMAs for file-based databases
    const url = process.env.TURSO_DATABASE_URL || 'file:leitner.db';
    if (url.startsWith('file:')) {
      await db.execute('PRAGMA busy_timeout = 5000;');
      await db.execute('PRAGMA journal_mode = WAL;');
      await db.execute('PRAGMA synchronous = NORMAL;');
    }
    pragmasConfigured = true;
  } catch {
    // Ignore pragma errors for cloud providers
  }
}

export async function initDb(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = getDb();
    await configurePragmas(db);

    // Create cards table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        box INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        last_reviewed_at INTEGER,
        review_count INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Create settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Check if admin password setting exists; if not, initialize with "Amber test"
    const passwordSetting = await db.execute({
      sql: 'SELECT value FROM settings WHERE key = ?',
      args: ['edit_password_hash'],
    });

    if (passwordSetting.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Amber test', salt);
      await db.execute({
        sql: 'INSERT INTO settings (key, value) VALUES (?, ?)',
        args: ['edit_password_hash', hash],
      });
    }

    // Check if cards table is empty; if so, populate with starter Leitner cards
    const existingCards = await db.execute('SELECT COUNT(*) as count FROM cards');
    const count = Number(existingCards.rows[0]?.count || 0);

    if (count === 0) {
      const now = Date.now();
      const starterCards = [
        {
          id: 'card-1',
          question: 'What is the core principle of the Leitner Box Method?',
          answer: 'Cards you answer correctly are moved to boxes reviewed less frequently, while incorrect cards drop back to Box 1 for immediate daily reinforcement.',
          box: 1,
          created_at: now - 86400000 * 2,
          last_reviewed_at: null,
          review_count: 0,
          streak: 0,
        },
        {
          id: 'card-2',
          question: 'How does Box 2 (Weekly) operate under the schedule?',
          answer: 'Weekly cards are scheduled for review every Sunday. Correct answers graduate to Box 3 (Monthly), while mistakes drop back to Box 1 (Daily).',
          box: 2,
          created_at: now - 86400000 * 5,
          last_reviewed_at: now - 86400000 * 7,
          review_count: 1,
          streak: 1,
        },
        {
          id: 'card-3',
          question: 'What is the "Spacing Effect" in cognitive psychology?',
          answer: 'Learning is far more robust when study sessions are spaced out over intervals over time rather than crammed into a single session.',
          box: 1,
          created_at: now - 86400000 * 1,
          last_reviewed_at: null,
          review_count: 0,
          streak: 0,
        },
        {
          id: 'card-4',
          question: 'What happens when a card reaches Box 3 (Monthly)?',
          answer: 'The card represents long-term crystallized knowledge. It remains in Box 3 for monthly maintenance reviews unless deleted.',
          box: 3,
          created_at: now - 86400000 * 20,
          last_reviewed_at: now - 86400000 * 15,
          review_count: 3,
          streak: 3,
        },
        {
          id: 'card-5',
          question: 'What is "Active Recall" vs passive reading?',
          answer: 'Active recall forces your brain to retrieve knowledge from memory before viewing the answer, strengthening neural retrieval pathways.',
          box: 1,
          created_at: now,
          last_reviewed_at: null,
          review_count: 0,
          streak: 0,
        },
      ];

      for (const c of starterCards) {
        await db.execute({
          sql: 'INSERT INTO cards (id, question, answer, box, created_at, last_reviewed_at, review_count, streak) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [c.id, c.question, c.answer, c.box, c.created_at, c.last_reviewed_at, c.review_count, c.streak],
        });
      }
    }
  })();

  return initPromise;
}
