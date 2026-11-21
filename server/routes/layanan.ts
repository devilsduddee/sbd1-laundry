import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, asc, desc, and, ne, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { LYN, DTL_PSN } from '../db/schema.js';
import {
  createLayananSchema,
  updateLayananSchema,
  type Layanan,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const layananRoute = new Hono();

// Semua yang login bisa melihat daftar layanan
layananRoute.get('/', authMiddleware, async (c) => {
  const data = (await db.select().from(LYN).orderBy(asc(LYN.nm_lyn))) as Layanan[];
  return c.json({ data });
});

// Modifikasi data master layanan khusus peran Admin
layananRoute.post(
  '/',
  authMiddleware,
  requireRole('Admin'),
  zValidator('json', createLayananSchema),
  async (c) => {
    const { nm_lyn, hrg_kg, est_hari } = c.req.valid('json');

    // Cek duplikasi nama layanan
    const check = await db
      .select({ id_lyn: LYN.id_lyn })
      .from(LYN)
      .where(eq(LYN.nm_lyn, nm_lyn))
      .limit(1);

    if (check.length > 0) {
      return c.json({ error: 'Nama layanan sudah ada' }, 409);
    }

    // Buat ID baru LYN-XXX berdasarkan ID numerik terbesar
    const lastRes = await db
      .select({ id_lyn: LYN.id_lyn })
      .from(LYN)
      .orderBy(desc(LYN.id_lyn))
      .limit(1);

    let nextNum = 1;
    if (lastRes.length > 0) {
      const match = String(lastRes[0].id_lyn).match(/\d+$/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }
    const id_lyn = `LYN-${String(nextNum).padStart(3, '0')}`;

    await db.insert(LYN).values({ id_lyn, nm_lyn, hrg_kg, est_hari });

    const data: Layanan = { id_lyn, nm_lyn, hrg_kg, est_hari };
    return c.json({ data }, 201);
  }
);

// PATCH /api/layanan/:id (Admin)
layananRoute.patch(
  '/:id',
  authMiddleware,
  requireRole('Admin'),
  zValidator('json', updateLayananSchema),
  async (c) => {
    const id_lyn = c.req.param('id');
    const body = c.req.valid('json');

    const existing = await db
      .select()
      .from(LYN)
      .where(eq(LYN.id_lyn, id_lyn))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: 'Layanan tidak ditemukan' }, 404);
    }

    if (body.nm_lyn) {
      const check = await db
        .select({ id_lyn: LYN.id_lyn })
        .from(LYN)
        .where(and(eq(LYN.nm_lyn, body.nm_lyn), ne(LYN.id_lyn, id_lyn)))
        .limit(1);

      if (check.length > 0) {
        return c.json({ error: 'Nama layanan sudah digunakan' }, 409);
      }
    }

    const current = existing[0];
    const updated: Layanan = {
      id_lyn,
      nm_lyn: body.nm_lyn ?? current.nm_lyn,
      hrg_kg: body.hrg_kg ?? current.hrg_kg,
      est_hari: body.est_hari ?? current.est_hari,
    };

    await db
      .update(LYN)
      .set({
        nm_lyn: updated.nm_lyn,
        hrg_kg: updated.hrg_kg,
        est_hari: updated.est_hari,
      })
      .where(eq(LYN.id_lyn, id_lyn));

    return c.json({ data: updated });
  }
);

// DELETE /api/layanan/:id (Admin)
layananRoute.delete('/:id', authMiddleware, requireRole('Admin'), async (c) => {
  const id_lyn = c.req.param('id');

  // Cegah hapus jika sudah dipakai di histori transaksi
  const check = await db
    .select({ count: sql<number>`count(*)` })
    .from(DTL_PSN)
    .where(eq(DTL_PSN.id_lyn, id_lyn));

  if (Number(check[0]?.count || 0) > 0) {
    return c.json(
      { error: 'Layanan tidak dapat dihapus karena sudah tercatat pada histori pesanan.' },
      409
    );
  }

  await db.delete(LYN).where(eq(LYN.id_lyn, id_lyn));

  return c.json({ ok: true, message: 'Layanan berhasil dihapus' });
});
