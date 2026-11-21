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

const normalizedUrl = databaseUrl.replace(/^libsql:\/\//, 'https://');

/**
 * Custom Fetch Handler untuk runtime Serverless Node.js (Vercel).
 * Memastikan header Authorization: Bearer <token> diteruskan dengan utuh
 * dan mencegah isu header-stripping pada instance Request di lingkungan Lambda.
 */
const customFetch = async (input: any, init?: any) => {
  const token = authToken || '';

  let targetUrl: string;
  let method = 'POST';
  let body: any = undefined;
  const headers: Record<string, string> = {};

  if (typeof input === 'string') {
    targetUrl = input;
  } else if (input instanceof URL) {
    targetUrl = input.toString();
  } else if (input && typeof input === 'object') {
    targetUrl = input.url ? input.url.toString() : '';
    method = input.method || 'POST';
    if (input.headers && typeof input.headers.forEach === 'function') {
      input.headers.forEach((v: string, k: string) => {
        headers[k.toLowerCase()] = v;
      });
    }
    if (typeof input.text === 'function') {
      try {
        body = await input.text();
      } catch {
        body = input.body;
      }
    } else if (input.body !== undefined) {
      body = input.body;
    }
  } else {
    targetUrl = String(input);
  }

  if (init) {
    if (init.method) method = init.method;
    if (init.body !== undefined) body = init.body;
    if (init.headers) {
      if (typeof init.headers.forEach === 'function') {
        init.headers.forEach((v: string, k: string) => {
          headers[k.toLowerCase()] = v;
        });
      } else if (Array.isArray(init.headers)) {
        for (const [k, v] of init.headers) {
          headers[k.toLowerCase()] = v;
        }
      } else if (typeof init.headers === 'object') {
        for (const [k, v] of Object.entries(init.headers)) {
          headers[k.toLowerCase()] = String(v);
        }
      }
    }
  }

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }
  if (!headers['content-type']) {
    headers['content-type'] = 'application/json';
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };
  if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
    fetchOptions.body = body;
  }

  return fetch(targetUrl, fetchOptions);
};

export const client: Client = createClient({
  url: normalizedUrl,
  authToken: authToken || undefined,
  fetch: customFetch,
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
