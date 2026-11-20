import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/client.js';
import { createBayarSchema, type Bayar } from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const bayarRoute = new Hono();

// POST /api/bayar (Prosedur 5 — Catat Pembayaran Lunas)
bayarRoute.post(
  '/',
  authMiddleware,
  requireRole('Admin', 'Kasir'),
  zValidator('json', createBayarSchema),
  async (c) => {
    const user = c.get('user');
    const { id_psn, met_byr, jml_byr } = c.req.valid('json');

    // 1. Ambil data pesanan
    const psnRes = await db.execute({
      sql: 'SELECT id_psn, tot_hrg FROM PSN WHERE id_psn = ?',
      args: [id_psn],
    });

    if (psnRes.rows.length === 0) {
      return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
    }

    const tot_hrg = Number(psnRes.rows[0].tot_hrg);

    // 2. Cek apakah pesanan sudah lunas
    const existingBayar = await db.execute({
      sql: "SELECT id_byr FROM BYR WHERE id_psn = ? AND sts_byr = 'Lunas'",
      args: [id_psn],
    });

    if (existingBayar.rows.length > 0) {
      return c.json({ error: 'Pesanan ini sudah berstatus Lunas.' }, 409);
    }

    // 3. Cek apakah jumlah bayar mencukupi total tagihan
    if (jml_byr < tot_hrg) {
      return c.json(
        {
          error: `Jumlah bayar (Rp ${jml_byr.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${tot_hrg.toLocaleString('id-ID')}).`,
        },
        400
      );
    }

    const now = new Date();
    const tgl_byr = now.toISOString();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const id_byr = `BYR-${dateStr}-${rand}`;

    await db.execute({
      sql: `INSERT INTO BYR (id_byr, id_psn, id_ptgs, tgl_byr, met_byr, jml_byr, sts_byr)
            VALUES (?, ?, ?, ?, ?, ?, 'Lunas')`,
      args: [id_byr, id_psn, user.id_ptgs, tgl_byr, met_byr, jml_byr],
    });

    const data: Bayar = {
      id_byr,
      id_psn,
      id_ptgs: user.id_ptgs,
      tgl_byr,
      met_byr,
      jml_byr,
      sts_byr: 'Lunas',
      nm_ptgs: user.nm_ptgs,
    };

    return c.json({ data }, 201);
  }
);
