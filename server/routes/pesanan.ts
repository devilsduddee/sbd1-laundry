import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/client.js';
import {
  createPesananSchema,
  updateStatusPesananSchema,
  type Pesanan,
  type PesananSummary,
  type PesananDetailResponse,
  type StsPsn,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const pesananRoute = new Hono();

// GET /api/pesanan (List ringkasan pesanan + filter)
pesananRoute.get('/', authMiddleware, async (c) => {
  const sts = c.req.query('sts_psn');
  const q = c.req.query('q')?.trim();

  let sql = `
    SELECT 
      p.id_psn, p.id_plgn, p.id_ptgs, p.tgl_msk, p.est_sls, p.tot_hrg, p.sts_psn,
      c.nm_plgn, c.no_hp,
      pt.nm_ptgs,
      COALESCE(b.sts_byr, 'Belum Lunas') as sts_byr,
      b.met_byr, b.tgl_byr
    FROM PSN p
    JOIN PLGN c ON p.id_plgn = c.id_plgn
    JOIN PTGS pt ON p.id_ptgs = pt.id_ptgs
    LEFT JOIN BYR b ON p.id_psn = b.id_psn AND b.sts_byr = 'Lunas'
    WHERE 1=1
  `;
  const args: any[] = [];

  if (sts) {
    sql += ' AND p.sts_psn = ?';
    args.push(sts);
  }

  if (q) {
    sql += ' AND (p.id_psn LIKE ? OR c.nm_plgn LIKE ? OR c.no_hp LIKE ?)';
    args.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  sql += ' ORDER BY p.tgl_msk DESC';

  const res = await db.execute({ sql, args });
  const data = res.rows as unknown as PesananSummary[];

  return c.json({ data });
});

// GET /api/pesanan/:id (Detail Tiket Pesanan Output 3 & 4)
pesananRoute.get('/:id', authMiddleware, async (c) => {
  const id_psn = c.req.param('id');

  // Ambil data PSN, PLGN, PTGS
  const psnRes = await db.execute({
    sql: `
      SELECT 
        p.id_psn, p.id_plgn, p.id_ptgs, p.tgl_msk, p.est_sls, p.tot_hrg, p.sts_psn,
        c.nm_plgn, c.no_hp, c.alamat,
        pt.nm_ptgs, pt.usernm, pt.level
      FROM PSN p
      JOIN PLGN c ON p.id_plgn = c.id_plgn
      JOIN PTGS pt ON p.id_ptgs = pt.id_ptgs
      WHERE p.id_psn = ?
    `,
    args: [id_psn],
  });

  if (psnRes.rows.length === 0) {
    return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
  }

  const pRow = psnRes.rows[0];

  // Ambil detail item DTL_PSN + LYN
  const itemsRes = await db.execute({
    sql: `
      SELECT d.id_psn, d.id_lyn, d.brt_kg, d.hrg_trans, l.nm_lyn, l.est_hari
      FROM DTL_PSN d
      JOIN LYN l ON d.id_lyn = l.id_lyn
      WHERE d.id_psn = ?
      ORDER BY l.nm_lyn ASC
    `,
    args: [id_psn],
  });

  // Ambil pembayaran BYR jika sudah ada
  const bayarRes = await db.execute({
    sql: `
      SELECT b.id_byr, b.id_psn, b.id_ptgs, b.tgl_byr, b.met_byr, b.jml_byr, b.sts_byr, pt.nm_ptgs
      FROM BYR b
      JOIN PTGS pt ON b.id_ptgs = pt.id_ptgs
      WHERE b.id_psn = ?
      LIMIT 1
    `,
    args: [id_psn],
  });

  const response: PesananDetailResponse = {
    psn: {
      id_psn: pRow.id_psn as string,
      id_plgn: pRow.id_plgn as string,
      id_ptgs: pRow.id_ptgs as string,
      tgl_msk: pRow.tgl_msk as string,
      est_sls: pRow.est_sls as string,
      tot_hrg: Number(pRow.tot_hrg),
      sts_psn: pRow.sts_psn as StsPsn,
    },
    plgn: {
      id_plgn: pRow.id_plgn as string,
      nm_plgn: pRow.nm_plgn as string,
      no_hp: pRow.no_hp as string,
      alamat: pRow.alamat as string,
    },
    ptgs: {
      id_ptgs: pRow.id_ptgs as string,
      nm_ptgs: pRow.nm_ptgs as string,
      usernm: pRow.usernm as string,
      level: pRow.level as any,
    },
    items: itemsRes.rows.map((r: any) => ({
      id_psn: r.id_psn,
      id_lyn: r.id_lyn,
      brt_kg: Number(r.brt_kg),
      hrg_trans: Number(r.hrg_trans),
      nm_lyn: r.nm_lyn,
      est_hari: Number(r.est_hari),
    })),
    bayar:
      bayarRes.rows.length > 0
        ? {
            id_byr: bayarRes.rows[0].id_byr as string,
            id_psn: bayarRes.rows[0].id_psn as string,
            id_ptgs: bayarRes.rows[0].id_ptgs as string,
            tgl_byr: bayarRes.rows[0].tgl_byr as string,
            met_byr: bayarRes.rows[0].met_byr as any,
            jml_byr: Number(bayarRes.rows[0].jml_byr),
            sts_byr: bayarRes.rows[0].sts_byr as any,
            nm_ptgs: bayarRes.rows[0].nm_ptgs as string,
          }
        : null,
  };

  return c.json(response);
});

// POST /api/pesanan (Buat Tiket Pesanan + Multi Detail Cucian)
pesananRoute.post(
  '/',
  authMiddleware,
  requireRole('Admin', 'Kasir'),
  zValidator('json', createPesananSchema),
  async (c) => {
    const user = c.get('user');
    const { id_plgn, items, bayar_langsung } = c.req.valid('json');

    // 1. Cek validitas pelanggan
    const plgnCheck = await db.execute({
      sql: 'SELECT id_plgn FROM PLGN WHERE id_plgn = ?',
      args: [id_plgn],
    });
    if (plgnCheck.rows.length === 0) {
      return c.json({ error: 'Pelanggan tidak valid' }, 404);
    }

    // 2. Gabungkan (merge) layanan duplikat agar cocok dengan Composite PK (id_psn, id_lyn)
    const mergedMap = new Map<string, number>();
    for (const it of items) {
      const cur = mergedMap.get(it.id_lyn) || 0;
      mergedMap.set(it.id_lyn, cur + it.brt_kg);
    }

    const uniqueLynIds = Array.from(mergedMap.keys());
    const placeholders = uniqueLynIds.map(() => '?').join(',');
    const lynRes = await db.execute({
      sql: `SELECT id_lyn, hrg_kg, est_hari FROM LYN WHERE id_lyn IN (${placeholders})`,
      args: uniqueLynIds,
    });

    if (lynRes.rows.length !== uniqueLynIds.length) {
      return c.json({ error: 'Satu atau lebih layanan tidak ditemukan di master data' }, 400);
    }

    const lynMap = new Map<string, { hrg_kg: number; est_hari: number }>();
    for (const r of lynRes.rows) {
      lynMap.set(r.id_lyn as string, {
        hrg_kg: Number(r.hrg_kg),
        est_hari: Number(r.est_hari),
      });
    }

    // 3. Kalkulasi Server-Side: tot_hrg & est_sls
    let tot_hrg = 0;
    let max_est_hari = 1;
    const finalItems: { id_lyn: string; brt_kg: number; hrg_trans: number }[] = [];

    for (const [id_lyn, brt_kg] of mergedMap.entries()) {
      const l = lynMap.get(id_lyn)!;
      const subtotal = Math.round(brt_kg * l.hrg_kg);
      tot_hrg += subtotal;
      if (l.est_hari > max_est_hari) max_est_hari = l.est_hari;
      finalItems.push({ id_lyn, brt_kg, hrg_trans: l.hrg_kg });
    }

    const now = new Date();
    const tgl_msk = now.toISOString();
    const estDate = new Date(now.getTime() + max_est_hari * 24 * 60 * 60 * 1000);
    const est_sls = estDate.toISOString();

    // Generate ID Pesanan: PSN-YYYYMMDD-XXXX
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const id_psn = `PSN-${dateStr}-${rand}`;

    // 4. Batch Atomic Transaction
    const batchStmts: any[] = [
      {
        sql: `INSERT INTO PSN (id_psn, id_plgn, id_ptgs, tgl_msk, est_sls, tot_hrg, sts_psn)
              VALUES (?, ?, ?, ?, ?, ?, 'Antrean')`,
        args: [id_psn, id_plgn, user.id_ptgs, tgl_msk, est_sls, tot_hrg],
      },
    ];

    for (const it of finalItems) {
      batchStmts.push({
        sql: `INSERT INTO DTL_PSN (id_psn, id_lyn, brt_kg, hrg_trans)
              VALUES (?, ?, ?, ?)`,
        args: [id_psn, it.id_lyn, it.brt_kg, it.hrg_trans],
      });
    }

    // Jika bayar di awal sekaligus
    if (bayar_langsung) {
      if (bayar_langsung.jml_byr < tot_hrg) {
        return c.json(
          { error: `Nominal bayar (${bayar_langsung.jml_byr}) kurang dari total tagihan (${tot_hrg})` },
          400
        );
      }
      const id_byr = `BYR-${dateStr}-${rand}`;
      batchStmts.push({
        sql: `INSERT INTO BYR (id_byr, id_psn, id_ptgs, tgl_byr, met_byr, jml_byr, sts_byr)
              VALUES (?, ?, ?, ?, ?, ?, 'Lunas')`,
        args: [
          id_byr,
          id_psn,
          user.id_ptgs,
          tgl_msk,
          bayar_langsung.met_byr,
          bayar_langsung.jml_byr,
        ],
      });
    }

    await db.batch(batchStmts, 'write');

    const createdPsn: Pesanan = {
      id_psn,
      id_plgn,
      id_ptgs: user.id_ptgs,
      tgl_msk,
      est_sls,
      tot_hrg,
      sts_psn: 'Antrean',
    };

    return c.json({ data: createdPsn, items: finalItems }, 201);
  }
);

// PATCH /api/pesanan/:id/status (Prosedur 4 — Update status bertahap)
pesananRoute.patch(
  '/:id/status',
  authMiddleware,
  requireRole('Admin', 'Operasional'),
  zValidator('json', updateStatusPesananSchema),
  async (c) => {
    const id_psn = c.req.param('id');
    const { sts_psn } = c.req.valid('json');

    const existing = await db.execute({
      sql: 'SELECT id_psn, sts_psn FROM PSN WHERE id_psn = ?',
      args: [id_psn],
    });

    if (existing.rows.length === 0) {
      return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
    }

    const cur = existing.rows[0].sts_psn as StsPsn;

    // Transisi 'Sudah Diambil' wajib via /ambil
    if (sts_psn === 'Sudah Diambil') {
      return c.json(
        { error: 'Pengambilan cucian harus diproses melalui prosedur serah terima cucian.' },
        400
      );
    }

    await db.execute({
      sql: 'UPDATE PSN SET sts_psn = ? WHERE id_psn = ?',
      args: [sts_psn, id_psn],
    });

    return c.json({ ok: true, id_psn, sts_psn });
  }
);

// PATCH /api/pesanan/:id/ambil (Prosedur 6 — Ambil Cucian & Tutup Transaksi)
pesananRoute.patch(
  '/:id/ambil',
  authMiddleware,
  requireRole('Admin', 'Kasir'),
  async (c) => {
    const id_psn = c.req.param('id');

    const psnRes = await db.execute({
      sql: 'SELECT id_psn, sts_psn FROM PSN WHERE id_psn = ?',
      args: [id_psn],
    });

    if (psnRes.rows.length === 0) {
      return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
    }

    const curSts = psnRes.rows[0].sts_psn as string;

    if (curSts !== 'Siap Diambil') {
      return c.json(
        { error: `Cucian belum siap diambil (status saat ini: ${curSts}). Harap tunggu hingga Siap Diambil.` },
        409
      );
    }

    // Validasi Pembayaran Lunas
    const byrRes = await db.execute({
      sql: "SELECT id_byr FROM BYR WHERE id_psn = ? AND sts_byr = 'Lunas'",
      args: [id_psn],
    });

    if (byrRes.rows.length === 0) {
      return c.json(
        { error: 'Pesanan belum lunas! Wajib mencatat pembayaran lunas terlebih dahulu sebelum menyerahkan cucian.' },
        409
      );
    }

    await db.execute({
      sql: "UPDATE PSN SET sts_psn = 'Sudah Diambil' WHERE id_psn = ?",
      args: [id_psn],
    });

    return c.json({ ok: true, id_psn, sts_psn: 'Sudah Diambil' });
  }
);
