import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import fs from 'fs';
import path from 'path';
import * as schema from './schema.js';

// Bersihkan spasi dan tanda kutip yang tidak sengaja terbawa saat copy-paste di dashboard Vercel
const rawDbUrl = process.env.TURSO_DATABASE_URL;
const rawAuthToken = process.env.TURSO_AUTH_TOKEN;

const databaseUrl = rawDbUrl?.trim().replace(/^["']|["']$/g, '');
const authToken = rawAuthToken?.trim().replace(/^["']|["']$/g, '');

if (!databaseUrl) {
  throw new Error(
    'TURSO_DATABASE_URL belum dikonfigurasi di Environment Variables Vercel.'
  );
}

if (!authToken) {
  console.error(
    '[TURSO_WARNING] TURSO_AUTH_TOKEN belum terdeteksi di environment variables. Pastikan sudah ditambahkan di Vercel Dashboard.'
  );
}

export const client: Client = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

export const db = drizzle(client, { schema });

let dbInitialized = false;

/**
 * Memastikan skema basis data awal dan constraint foreign keys aktif di Turso.
 * Dilengkapi in-memory flag agar tidak melakukan roundtrip SELECT berulang ke Turso pada warmed container.
 */
export async function initDb() {
  if (dbInitialized) return;

  try {
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

    dbInitialized = true;
    console.log('[DB] Inisialisasi basis data Turso berhasil.');
  } catch (err: any) {
    if (err?.status === 401 || err?.message?.includes('401')) {
      console.error(
        '[TURSO_AUTH_ERROR] Turso mengembalikan HTTP 401 Unauthorized. Pastikan TURSO_AUTH_TOKEN dan TURSO_DATABASE_URL di Vercel Dashboard (Settings > Environment Variables) sudah diisi dengan benar tanpa tanda kutip ganda dan telah dilakukan Redeploy.'
      );
    }
    throw err;
  }
}
