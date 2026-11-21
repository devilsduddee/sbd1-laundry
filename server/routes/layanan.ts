import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/client.js';
import {
  createLayananSchema,
  updateLayananSchema,
  type Layanan,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const layananRoute = new Hono();

// Semua yang login bisa melihat daftar layanan
layananRoute.get('/', authMiddleware, async (c) => {
  const res = await db.execute(
    'SELECT id_lyn, nm_lyn, hrg_kg, est_hari FROM LYN ORDER BY nm_lyn ASC'
  );
  const data = res.rows as unknown as Layanan[];
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
    const check = await db.execute({
      sql: 'SELECT id_lyn FROM LYN WHERE nm_lyn = ?',
      args: [nm_lyn],
    });

    if (check.rows.length > 0) {
      return c.json({ error: 'Nama layanan sudah ada' }, 409);
    }

    // Buat ID baru LYN-XXX berdasarkan ID numerik terbesar
    const lastRes = await db.execute('SELECT id_lyn FROM LYN ORDER BY id_lyn DESC LIMIT 1');
    let nextNum = 1;
    if (lastRes.rows.length > 0) {
      const match = String(lastRes.rows[0].id_lyn).match(/\d+$/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }
    const id_lyn = `LYN-${String(nextNum).padStart(3, '0')}`;

    await db.execute({
      sql: 'INSERT INTO LYN (id_lyn, nm_lyn, hrg_kg, est_hari) VALUES (?, ?, ?, ?)',
      args: [id_lyn, nm_lyn, hrg_kg, est_hari],
    });

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

    const existing = await db.execute({
      sql: 'SELECT id_lyn, nm_lyn, hrg_kg, est_hari FROM LYN WHERE id_lyn = ?',
      args: [id_lyn],
    });

    if (existing.rows.length === 0) {
      return c.json({ error: 'Layanan tidak ditemukan' }, 404);
    }

    if (body.nm_lyn) {
      const check = await db.execute({
        sql: 'SELECT id_lyn FROM LYN WHERE nm_lyn = ? AND id_lyn != ?',
        args: [body.nm_lyn, id_lyn],
      });
      if (check.rows.length > 0) {
        return c.json({ error: 'Nama layanan sudah digunakan' }, 409);
      }
    }

    const current = existing.rows[0];
    const updated: Layanan = {
      id_lyn,
      nm_lyn: body.nm_lyn ?? (current.nm_lyn as string),
      hrg_kg: body.hrg_kg ?? Number(current.hrg_kg),
      est_hari: body.est_hari ?? Number(current.est_hari),
    };

    await db.execute({
      sql: 'UPDATE LYN SET nm_lyn = ?, hrg_kg = ?, est_hari = ? WHERE id_lyn = ?',
      args: [updated.nm_lyn, updated.hrg_kg, updated.est_hari, id_lyn],
    });

    return c.json({ data: updated });
  }
);

// DELETE /api/layanan/:id (Admin)
layananRoute.delete('/:id', authMiddleware, requireRole('Admin'), async (c) => {
  const id_lyn = c.req.param('id');

  // Cegah hapus jika sudah dipakai di histori transaksi
  const check = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM DTL_PSN WHERE id_lyn = ?',
    args: [id_lyn],
  });

  if (Number(check.rows[0].count) > 0) {
    return c.json(
      { error: 'Layanan tidak dapat dihapus karena sudah tercatat pada histori pesanan.' },
      409
    );
  }

  await db.execute({
    sql: 'DELETE FROM LYN WHERE id_lyn = ?',
    args: [id_lyn],
  });

  return c.json({ ok: true, message: 'Layanan berhasil dihapus' });
});
