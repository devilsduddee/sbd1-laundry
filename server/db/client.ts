import { createClient, type Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db: Client = createClient({
  url: databaseUrl,
  authToken: authToken,
});

/**
 * Memastikan skema basis data awal dan constraint foreign keys aktif.
 */
export async function initDb() {
  await db.execute('PRAGMA foreign_keys = ON;');

  // Cek apakah tabel PLGN sudah ada
  const check = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='PLGN';"
  );

  if (check.rows.length === 0) {
    const schemaPath = path.resolve(process.cwd(), 'server/db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const statements = sql
        .replace(/--.*$/gm, '')
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }
    }
  }
}
