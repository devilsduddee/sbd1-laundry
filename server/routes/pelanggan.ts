import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/client.js';
import {
  createPelangganSchema,
  updatePelangganSchema,
  type Pelanggan,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const pelangganRoute = new Hono();

// Seluruh endpoint pelanggan memerlukan login Admin atau Kasir
pelangganRoute.use('*', authMiddleware, requireRole('Admin', 'Kasir'));

// GET /api/pelanggan (Output 1)
pelangganRoute.get('/', async (c) => {
  const q = c.req.query('q')?.trim() || '';

  let query = 'SELECT id_plgn, nm_plgn, no_hp, alamat FROM PLGN';
  const args: any[] = [];

  if (q) {
    query += ' WHERE nm_plgn LIKE ? OR no_hp LIKE ?';
    args.push(`%${q}%`, `%${q}%`);
  }

  query += ' ORDER BY nm_plgn ASC';

  const res = await db.execute({ sql: query, args });
  const data = res.rows as unknown as Pelanggan[];

  return c.json({ data });
});

// POST /api/pelanggan (Prosedur 1)
pelangganRoute.post('/', zValidator('json', createPelangganSchema), async (c) => {
  const { nm_plgn, no_hp, alamat } = c.req.valid('json');

  // Cek duplikasi nomor HP
  const check = await db.execute({
    sql: 'SELECT id_plgn FROM PLGN WHERE no_hp = ?',
    args: [no_hp],
  });

  if (check.rows.length > 0) {
    return c.json({ error: 'Nomor HP pelanggan sudah terdaftar' }, 409);
  }

  // Buat ID baru PLG-XXXX berdasarkan ID numerik terbesar
  const lastRes = await db.execute('SELECT id_plgn FROM PLGN ORDER BY id_plgn DESC LIMIT 1');
  let nextNum = 1;
  if (lastRes.rows.length > 0) {
    const match = String(lastRes.rows[0].id_plgn).match(/\d+$/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }
  const id_plgn = `PLG-${String(nextNum).padStart(4, '0')}`;

  await db.execute({
    sql: 'INSERT INTO PLGN (id_plgn, nm_plgn, no_hp, alamat) VALUES (?, ?, ?, ?)',
    args: [id_plgn, nm_plgn, no_hp, alamat],
  });

  const created: Pelanggan = { id_plgn, nm_plgn, no_hp, alamat };
  return c.json({ data: created }, 201);
});

// PATCH /api/pelanggan/:id
pelangganRoute.patch('/:id', zValidator('json', updatePelangganSchema), async (c) => {
  const id_plgn = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db.execute({
    sql: 'SELECT id_plgn, nm_plgn, no_hp, alamat FROM PLGN WHERE id_plgn = ?',
    args: [id_plgn],
  });

  if (existing.rows.length === 0) {
    return c.json({ error: 'Pelanggan tidak ditemukan' }, 404);
  }

  if (body.no_hp) {
    const check = await db.execute({
      sql: 'SELECT id_plgn FROM PLGN WHERE no_hp = ? AND id_plgn != ?',
      args: [body.no_hp, id_plgn],
    });
    if (check.rows.length > 0) {
      return c.json({ error: 'Nomor HP sudah digunakan pelanggan lain' }, 409);
    }
  }

  const current = existing.rows[0];
  const updated: Pelanggan = {
    id_plgn,
    nm_plgn: body.nm_plgn ?? (current.nm_plgn as string),
    no_hp: body.no_hp ?? (current.no_hp as string),
    alamat: body.alamat ?? (current.alamat as string),
  };

  await db.execute({
    sql: 'UPDATE PLGN SET nm_plgn = ?, no_hp = ?, alamat = ? WHERE id_plgn = ?',
    args: [updated.nm_plgn, updated.no_hp, updated.alamat, id_plgn],
  });

  return c.json({ data: updated });
});
