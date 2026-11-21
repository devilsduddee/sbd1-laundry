import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import fs from 'fs';
import path from 'path';
import * as schema from './schema.js';

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error(
    'TURSO_DATABASE_URL belum dikonfigurasi. Seluruh data wajib tersimpan di database Turso Cloud.'
  );
}

export const client: Client = createClient({
  url: databaseUrl,
  authToken: authToken,
});

export const db = drizzle(client, { schema });

/**
 * Memastikan skema basis data awal dan constraint foreign keys aktif di Turso.
 */
export async function initDb() {
  await client.execute('PRAGMA foreign_keys = ON;');

  // Cek apakah tabel PLGN sudah ada di Turso
  const check = await client.execute(
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
        await client.execute(statement);
      }
    }
  }
}
