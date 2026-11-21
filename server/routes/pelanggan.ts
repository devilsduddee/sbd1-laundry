import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, or, like, asc, desc, and, ne } from 'drizzle-orm';
import { db } from '../db/client.js';
import { PLGN } from '../db/schema.js';
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

  let query = db.select().from(PLGN);
  if (q) {
    const pattern = `%${q}%`;
    query = query.where(or(like(PLGN.nm_plgn, pattern), like(PLGN.no_hp, pattern))) as any;
  }

  const data = (await query.orderBy(asc(PLGN.nm_plgn))) as Pelanggan[];
  return c.json({ data });
});

// POST /api/pelanggan (Prosedur 1)
pelangganRoute.post('/', zValidator('json', createPelangganSchema), async (c) => {
  const { nm_plgn, no_hp, alamat } = c.req.valid('json');

  // Cek duplikasi nomor HP
  const check = await db
    .select({ id_plgn: PLGN.id_plgn })
    .from(PLGN)
    .where(eq(PLGN.no_hp, no_hp))
    .limit(1);

  if (check.length > 0) {
    return c.json({ error: 'Nomor HP pelanggan sudah terdaftar' }, 409);
  }

  // Buat ID baru PLG-XXXX berdasarkan ID numerik terbesar
  const lastRes = await db
    .select({ id_plgn: PLGN.id_plgn })
    .from(PLGN)
    .orderBy(desc(PLGN.id_plgn))
    .limit(1);

  let nextNum = 1;
  if (lastRes.length > 0) {
    const match = String(lastRes[0].id_plgn).match(/\d+$/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }
  const id_plgn = `PLG-${String(nextNum).padStart(4, '0')}`;

  await db.insert(PLGN).values({ id_plgn, nm_plgn, no_hp, alamat });

  const created: Pelanggan = { id_plgn, nm_plgn, no_hp, alamat };
  return c.json({ data: created }, 201);
});

// PATCH /api/pelanggan/:id
pelangganRoute.patch('/:id', zValidator('json', updatePelangganSchema), async (c) => {
  const id_plgn = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db
    .select()
    .from(PLGN)
    .where(eq(PLGN.id_plgn, id_plgn))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Pelanggan tidak ditemukan' }, 404);
  }

  if (body.no_hp) {
    const check = await db
      .select({ id_plgn: PLGN.id_plgn })
      .from(PLGN)
      .where(and(eq(PLGN.no_hp, body.no_hp), ne(PLGN.id_plgn, id_plgn)))
      .limit(1);

    if (check.length > 0) {
      return c.json({ error: 'Nomor HP sudah digunakan pelanggan lain' }, 409);
    }
  }

  const current = existing[0];
  const updated: Pelanggan = {
    id_plgn,
    nm_plgn: body.nm_plgn ?? current.nm_plgn,
    no_hp: body.no_hp ?? current.no_hp,
    alamat: body.alamat ?? current.alamat,
  };

  await db
    .update(PLGN)
    .set({
      nm_plgn: updated.nm_plgn,
      no_hp: updated.no_hp,
      alamat: updated.alamat,
    })
    .where(eq(PLGN.id_plgn, id_plgn));

  return c.json({ data: updated });
});
